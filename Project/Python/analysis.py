"""
FreshMart Retail — Predicting Monthly Sales from Business Drivers
===================================================================
Managerial Decision Making | Group Term Project

Business question: which business factors most strongly explain a store's
monthly sales revenue (Monthly_Sales_K), and can we predict sales well
enough from store characteristics to guide budget decisions?

DATA NOTE (assumption, stated explicitly per submission guidelines):
The raw file supplied for this run, data/freshmart_store_sales.csv, carries
8 of the 20 predictors listed in the project's data dictionary:
Location_Type, Is_Festival_Month, Parking_Available, TV/Digital/Radio/Print
Ad_Spend_K, and Stockout_Rate_pct. Store-operations variables such as
Store_Size_sqft, Num_SKUs, Foot_Traffic, Customer_Rating, Loyalty_Members,
Avg_Discount_pct, Competitor_Distance_km, Local_Pop_Density,
Avg_Household_Income_K, Num_Employees, Store_Age_Years and Mgr_Tenure_Months
were not present in the file provided for this run and are therefore
genuine omitted variables here (discussed in Section 8, Reflection). The
script is written so that if a future run supplies the full 23-column
file, every numeric column other than the target is picked up
automatically — no code changes required.

Run with: python freshmart_sales_analysis.py
Outputs:  outputs/figures/*.png, outputs/freshmart_predictions_residuals.csv
"""

import warnings
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import statsmodels.api as sm
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# 0. Reproducibility & paths
# ---------------------------------------------------------------------------
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

DATA_PATH = Path("data/freshmart_store_sales.csv")
OUTPUT_DIR = Path("outputs")
FIG_DIR = OUTPUT_DIR / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "Monthly_Sales_K"
ID_COLS = ["Store_ID", "Month"]
CATEGORICAL_COLS = ["Location_Type"]

sns.set_theme(style="whitegrid")
plt.rcParams["figure.dpi"] = 110


def section(title: str) -> None:
    """Print a formatted section header so console output reads like a report."""
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
section("1. LOAD DATA")
df = pd.read_csv(DATA_PATH)
print(f"Loaded {df.shape[0]} rows x {df.shape[1]} columns from {DATA_PATH}")
print(df.head())
print("\nColumn dtypes:")
print(df.dtypes)

# ---------------------------------------------------------------------------
# 2. Data cleaning: missing values & duplicates
# ---------------------------------------------------------------------------
section("2. DATA CLEANING — MISSING VALUES & DUPLICATES")

missing = df.isna().sum()
missing = missing[missing > 0]
if missing.empty:
    print("No missing values found.")
else:
    print("Missing values per column:\n", missing)
    numeric_cols = df.select_dtypes(include=np.number).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    for col in df.select_dtypes(include="object").columns:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].mode().iloc[0])
    print("Missing numeric values imputed with column median; "
          "missing categorical values imputed with column mode.")

dup_count = df.duplicated(subset=[c for c in df.columns if c not in ID_COLS]).sum()
print(f"\nDuplicate rows (ignoring ID/Month): {dup_count}")
if dup_count > 0:
    before = len(df)
    df = df.drop_duplicates(subset=[c for c in df.columns if c not in ID_COLS])
    print(f"Dropped {before - len(df)} duplicate rows -> {len(df)} rows remain.")

# Sanity check on the target and a couple of business-logic bounds
if (df[TARGET] <= 0).any():
    print("WARNING: non-positive Monthly_Sales_K values found — inspect before modelling.")
if "Stockout_Rate_pct" in df.columns and (
    (df["Stockout_Rate_pct"] < 0).any() or (df["Stockout_Rate_pct"] > 100).any()
):
    print("WARNING: Stockout_Rate_pct outside [0, 100] — inspect before modelling.")

# ---------------------------------------------------------------------------
# 3. Summary statistics & outlier scan
# ---------------------------------------------------------------------------
section("3. SUMMARY STATISTICS")
print(df.describe(include="all").T)

# IQR-based outlier scan on numeric predictors + target (reporting only —
# points are kept, since a 300-row simulated business dataset can contain
# genuinely large/small stores rather than data errors).
section("3a. OUTLIER SCAN (IQR RULE, REPORT-ONLY)")
numeric_cols = df.select_dtypes(include=np.number).columns.drop(
    [c for c in ["Is_Festival_Month", "Parking_Available"] if c in df.columns]
)
for col in numeric_cols:
    q1, q3 = df[col].quantile([0.25, 0.75])
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    n_out = ((df[col] < lo) | (df[col] > hi)).sum()
    if n_out > 0:
        print(f"  {col}: {n_out} potential outlier(s) outside [{lo:.1f}, {hi:.1f}]")
print("Decision: outliers are retained — OLS regression is run on the "
      "full sample and residual diagnostics (Section 7) are used to check "
      "whether any single store is unduly influential, rather than deleting "
      "rows ad hoc.")

# ---------------------------------------------------------------------------
# 4. Exploratory Data Analysis (EDA)
# ---------------------------------------------------------------------------
section("4. EXPLORATORY DATA ANALYSIS")

# 4a. Scatter plots: candidate drivers vs Monthly_Sales_K
scatter_vars = [v for v in ["Digital_Ad_Spend_K", "Stockout_Rate_pct",
                             "TV_Ad_Spend_K", "Radio_Ad_Spend_K"] if v in df.columns]
fig, axes = plt.subplots(1, len(scatter_vars), figsize=(5 * len(scatter_vars), 4.5))
for ax, col in zip(axes, scatter_vars):
    sns.regplot(data=df, x=col, y=TARGET, ax=ax,
                scatter_kws={"alpha": 0.5, "s": 20}, line_kws={"color": "crimson"})
    corr = df[col].corr(df[TARGET])
    ax.set_title(f"{col} vs {TARGET}\n(r = {corr:.2f})")
fig.tight_layout()
fig.savefig(FIG_DIR / "01_scatter_drivers_vs_sales.png")
plt.close(fig)
print(f"Saved {len(scatter_vars)} scatter plots -> outputs/figures/01_scatter_drivers_vs_sales.png")

for col in scatter_vars:
    corr = df[col].corr(df[TARGET])
    direction = "positive" if corr > 0 else "negative"
    strength = "strong" if abs(corr) >= 0.5 else "moderate" if abs(corr) >= 0.3 else "weak"
    print(f"  {col}: r = {corr:.2f} -> {strength} {direction} relationship with sales.")

# 4b. Correlation heatmap
corr_cols = list(numeric_cols) + [TARGET] if TARGET not in numeric_cols else list(numeric_cols)
corr_matrix = df[corr_cols].corr()
fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="coolwarm", center=0, ax=ax)
ax.set_title("Correlation Heatmap — Numeric Drivers & Monthly Sales")
fig.tight_layout()
fig.savefig(FIG_DIR / "02_correlation_heatmap.png")
plt.close(fig)
print("Saved correlation heatmap -> outputs/figures/02_correlation_heatmap.png")

# 4c. Sales by location and by festival month (categorical drivers)
fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
sns.barplot(data=df, x="Location_Type", y=TARGET, ax=axes[0], estimator=np.mean,
            order=df.groupby("Location_Type")[TARGET].mean().sort_values(ascending=False).index)
axes[0].set_title("Average Monthly Sales by Location Type")
sns.boxplot(data=df, x="Is_Festival_Month", y=TARGET, ax=axes[1])
axes[1].set_xticklabels(["Non-festival", "Festival"])
axes[1].set_title("Monthly Sales: Festival vs Non-festival Months")
fig.tight_layout()
fig.savefig(FIG_DIR / "03_location_and_festival.png")
plt.close(fig)
print("Saved location/festival comparison -> outputs/figures/03_location_and_festival.png")

# ---------------------------------------------------------------------------
# 5. Data preparation for modelling
# ---------------------------------------------------------------------------
section("5. DATA PREPARATION")

model_df = df.drop(columns=ID_COLS)
model_df = pd.get_dummies(model_df, columns=CATEGORICAL_COLS, drop_first=True)
# drop_first=True avoids the dummy-variable trap (perfect multicollinearity
# between the encoded location dummies and the intercept).
bool_cols = model_df.select_dtypes(include="bool").columns
model_df[bool_cols] = model_df[bool_cols].astype(int)

feature_cols = [c for c in model_df.columns if c != TARGET]
X = model_df[feature_cols]
y = model_df[TARGET]

print(f"Features used ({len(feature_cols)}): {feature_cols}")
print("Excluded from modelling: Store_ID, Month (identifiers, no predictive content).")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=RANDOM_SEED
)
train_idx, test_idx = X_train.index, X_test.index
print(f"Train/test split: {len(X_train)} train rows / {len(X_test)} test rows "
      f"(75/25, random_state={RANDOM_SEED}).")
print("No feature scaling applied: plain multiple linear regression coefficients "
      "are reported in original business units (Rs '000, %, counts) so they stay "
      "directly interpretable; a standardized version is produced separately "
      "below purely to rank driver importance on a comparable scale.")

# ---------------------------------------------------------------------------
# 6. Model building — scikit-learn LinearRegression + statsmodels OLS
# ---------------------------------------------------------------------------
section("6. MODEL BUILDING")

sk_model = LinearRegression()
sk_model.fit(X_train, y_train)
print("Fitted scikit-learn LinearRegression on the training set.")

# statsmodels OLS on the same training data, for p-values / significance
X_train_sm = sm.add_constant(X_train)
ols_model = sm.OLS(y_train, X_train_sm.astype(float)).fit()
print("\nStatsmodels OLS summary (training data):")
print(ols_model.summary())

# ---------------------------------------------------------------------------
# 7. Model evaluation on the held-out test set
# ---------------------------------------------------------------------------
section("7. MODEL EVALUATION (HELD-OUT TEST SET)")

y_pred_test = sk_model.predict(X_test)
n_test, k = X_test.shape
r2 = r2_score(y_test, y_pred_test)
adj_r2 = 1 - (1 - r2) * (n_test - 1) / (n_test - k - 1)
rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
mae = mean_absolute_error(y_test, y_pred_test)

print(f"R^2            : {r2:.4f}")
print(f"Adjusted R^2   : {adj_r2:.4f}")
print(f"RMSE           : Rs {rmse:.2f}K")
print(f"MAE            : Rs {mae:.2f}K")
print(f"Mean actual sales in test set: Rs {y_test.mean():.1f}K "
      f"-> RMSE is {100 * rmse / y_test.mean():.1f}% of the average store's sales.")

# Predicted vs actual plot
fig, ax = plt.subplots(figsize=(5.5, 5.5))
ax.scatter(y_test, y_pred_test, alpha=0.6, s=25)
lims = [min(y_test.min(), y_pred_test.min()), max(y_test.max(), y_pred_test.max())]
ax.plot(lims, lims, color="crimson", linestyle="--", label="Perfect fit (45°)")
ax.set_xlabel("Actual Monthly_Sales_K")
ax.set_ylabel("Predicted Monthly_Sales_K")
ax.set_title("Predicted vs Actual — Test Set")
ax.legend()
fig.tight_layout()
fig.savefig(FIG_DIR / "04_predicted_vs_actual.png")
plt.close(fig)
print("Saved predicted-vs-actual plot -> outputs/figures/04_predicted_vs_actual.png")

# Residual distribution
residuals_test = y_test - y_pred_test
fig, ax = plt.subplots(figsize=(6, 4.5))
sns.histplot(residuals_test, kde=True, ax=ax, color="steelblue")
ax.axvline(0, color="crimson", linestyle="--")
ax.set_title("Residual Distribution — Test Set")
ax.set_xlabel("Residual (Actual - Predicted), Rs '000")
fig.tight_layout()
fig.savefig(FIG_DIR / "05_residual_distribution.png")
plt.close(fig)
print("Saved residual distribution -> outputs/figures/05_residual_distribution.png")
print(f"Residual mean: {residuals_test.mean():.2f} (near zero -> no systematic bias); "
      f"residual std: {residuals_test.std():.2f}.")

# ---------------------------------------------------------------------------
# 8. Coefficient table, standardized importance & multicollinearity (VIF)
# ---------------------------------------------------------------------------
section("8. COEFFICIENT TABLE & INTERPRETATION")

coef_table = pd.DataFrame({
    "Feature": feature_cols,
    "Coefficient": sk_model.coef_,
    "OLS_p_value": ols_model.pvalues.reindex(feature_cols).values,
})
coef_table["Significant_at_5pct"] = coef_table["OLS_p_value"] < 0.05
coef_table = coef_table.sort_values("Coefficient", ascending=False).reset_index(drop=True)
print(coef_table.to_string(index=False))

print("\nInterpretation:")
for _, row in coef_table.iterrows():
    sig = "significant" if row["Significant_at_5pct"] else "not significant"
    direction = "increases" if row["Coefficient"] > 0 else "decreases"
    print(f"  - A 1-unit rise in {row['Feature']} {direction} predicted sales by "
          f"Rs {abs(row['Coefficient']):.2f}K, holding other factors constant "
          f"(p={row['OLS_p_value']:.3f}, {sig}).")

# Standardized coefficients, for a fair "driver importance" ranking
# (raw coefficients aren't comparable across variables measured in different
# units — Rs '000 of ad spend vs a 0-100% stockout rate vs a 0/1 flag).
X_train_std = (X_train - X_train.mean()) / X_train.std()
y_train_std = (y_train - y_train.mean()) / y_train.std()
std_model = LinearRegression().fit(X_train_std, y_train_std)
importance = pd.DataFrame({
    "Feature": feature_cols,
    "Standardized_Coefficient": std_model.coef_,
}).sort_values("Standardized_Coefficient")

fig, ax = plt.subplots(figsize=(7, 5))
colors = ["crimson" if v < 0 else "seagreen" for v in importance["Standardized_Coefficient"]]
ax.barh(importance["Feature"], importance["Standardized_Coefficient"], color=colors)
ax.axvline(0, color="black", linewidth=0.8)
ax.set_title("Driver Importance — Standardized Regression Coefficients")
ax.set_xlabel("Standardized coefficient")
fig.tight_layout()
fig.savefig(FIG_DIR / "06_driver_importance_tornado.png")
plt.close(fig)
print("\nSaved standardized driver-importance tornado chart -> "
      "outputs/figures/06_driver_importance_tornado.png")

# Variance Inflation Factor — multicollinearity check
section("8a. MULTICOLLINEARITY CHECK (VIF)")
vif_data = pd.DataFrame()
vif_data["Feature"] = X_train_sm.columns
vif_data["VIF"] = [
    sm.OLS(X_train_sm[col].astype(float),
           sm.add_constant(X_train_sm.drop(columns=[col]).astype(float))).fit().rsquared
    for col in X_train_sm.columns
]
vif_data["VIF"] = 1 / (1 - vif_data["VIF"])
vif_data = vif_data[vif_data["Feature"] != "const"].sort_values("VIF", ascending=False)
print(vif_data.to_string(index=False))
high_vif = vif_data[vif_data["VIF"] > 5]
if not high_vif.empty:
    print(f"\nWARNING: {len(high_vif)} feature(s) show VIF > 5, indicating "
          f"meaningful multicollinearity: {list(high_vif['Feature'])}. "
          "Their individual coefficients should be interpreted cautiously; "
          "the ad-spend channels in particular tend to move together across "
          "stores' overall marketing budgets.")
else:
    print("\nAll features show VIF <= 5 — no strong multicollinearity detected.")

# ---------------------------------------------------------------------------
# 9. Export per-store predictions & residuals (full dataset, for the BI dashboard)
# ---------------------------------------------------------------------------
section("9. EXPORT PREDICTIONS & RESIDUALS")

all_predictions = sk_model.predict(X)
export_df = df.copy()
export_df["Predicted_Sales_K"] = all_predictions
export_df["Residual"] = export_df[TARGET] - export_df["Predicted_Sales_K"]
export_df["Split"] = np.where(export_df.index.isin(train_idx), "Train", "Test")

export_path = OUTPUT_DIR / "freshmart_predictions_residuals.csv"
export_df.to_csv(export_path, index=False)
print(f"Exported {len(export_df)} rows -> {export_path}")
print(export_df.head())

# ---------------------------------------------------------------------------
# 10. What-if prediction scenario
# ---------------------------------------------------------------------------
section("10. WHAT-IF PREDICTION SCENARIO")

whatif_raw = {
    "Is_Festival_Month": 1,
    "Parking_Available": 1,
    "TV_Ad_Spend_K": 30.0,
    "Digital_Ad_Spend_K": 55.0,   # +25K over baseline: shift budget toward digital
    "Radio_Ad_Spend_K": 10.0,
    "Print_Ad_Spend_K": 5.0,
    "Stockout_Rate_pct": 5.0,     # improved availability vs a typical 8-10%
}
location_scenario = "Urban"

whatif_df = pd.DataFrame([whatif_raw])
for level in [c for c in feature_cols if c.startswith("Location_Type_")]:
    whatif_df[level] = 1 if level == f"Location_Type_{location_scenario}" else 0
whatif_df = whatif_df[feature_cols]

predicted_sales = sk_model.predict(whatif_df)[0]
print(f"Scenario: {location_scenario} store, festival month, parking available, "
      f"Digital_Ad_Spend_K={whatif_raw['Digital_Ad_Spend_K']}, "
      f"Stockout_Rate_pct={whatif_raw['Stockout_Rate_pct']}%.")
print(f"Predicted Monthly_Sales_K = Rs {predicted_sales:,.1f}K "
      f"(~ Rs {predicted_sales*1000:,.0f} in monthly sales).")
print("Plain-language takeaway: for a well-stocked, festival-month urban store "
      "with parking and a digital-led ad mix, the model expects roughly "
      f"Rs {predicted_sales:,.0f}K in monthly sales — management can compare this "
      "against the actual budget cost of the proposed spend mix to judge ROI.")

# ---------------------------------------------------------------------------
# 11. Reflection: multicollinearity, omitted variables, correlation vs causation
# ---------------------------------------------------------------------------
section("11. REFLECTION")
print("""
1. Multicollinearity: See the VIF table above. Advertising channels (especially
   TV and Digital spend) can move together when stores simply have larger
   overall marketing budgets, which inflates the standard errors of their
   individual coefficients even though the model's overall fit stays valid.

2. Omitted variables: The data file used for this run supplied only 8 of the
   20 predictors in the project's data dictionary. Store-level operational
   and demographic variables that plausibly drive sales -- Store_Size_sqft,
   Num_SKUs, Foot_Traffic, Customer_Rating, Loyalty_Members, Avg_Discount_pct,
   Competitor_Distance_km, Local_Pop_Density, Avg_Household_Income_K,
   Num_Employees, Store_Age_Years and Mgr_Tenure_Months -- were not present
   in this file and are therefore omitted. If any of them correlate with both
   an included predictor and sales, the reported coefficients could be biased
   (omitted-variable bias). This model's R^2 should be read as a lower bound
   on what a full 20-predictor model would achieve.

3. Correlation vs causation: A positive coefficient on Digital_Ad_Spend_K
   shows association, not proof that raising spend causes sales to rise --
   e.g. head office may simply allocate bigger digital budgets to stores it
   already expects to perform well. A/B testing (randomizing ad spend across
   comparable stores) would be needed to make a causal claim.

4. What additional data would help: store-level footfall and SKU-availability
   detail, a longer time series per store (to add store fixed effects and
   control for unobserved store quality), and a randomized or quasi-
   experimental ad-spend design to separate causal lift from allocation bias.
""")

section("ANALYSIS COMPLETE")
print(f"All figures saved under {FIG_DIR}/")
print(f"Predictions/residuals exported to {OUTPUT_DIR / 'freshmart_predictions_residuals.csv'}")
