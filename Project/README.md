# FreshMart Retail — Predicting Retail Sales from Multiple Business Drivers

Managerial Decision Making | Group Term Project

## Project Overview

FreshMart operates grocery/convenience stores across Metro, Urban, and Suburban
catchments. Marketing and operations disagreed on where the next rupee of
budget should go — more digital advertising, better in-stock availability,
deeper discounts, or new-store features such as parking. This project builds,
interprets, and stress-tests a multiple linear regression model that predicts
a store's monthly sales revenue (`Monthly_Sales_K`, Rs '000) from its business
characteristics, then communicates the findings through an interactive BI
dashboard and a structured presentation.

**Core question:** which business factors most strongly explain a store's
monthly sales revenue, and can we predict sales well enough to guide budget
decisions?

**Stated assumption:** the dataset supplied for this run
(`freshmart_predictions_residuals.csv` / `freshmart_store_sales.csv`) carries
8 of the 20 predictors documented in the original project data dictionary —
`Location_Type`, `Is_Festival_Month`, `Parking_Available`, the four ad-spend
channels (TV/Digital/Radio/Print), and `Stockout_Rate_pct`. Store-operations
variables such as `Store_Size_sqft`, `Foot_Traffic`, `Customer_Rating`,
`Loyalty_Members`, `Avg_Discount_pct`, `Competitor_Distance_km`,
`Local_Pop_Density`, `Avg_Household_Income_K`, `Num_Employees`,
`Store_Age_Years`, `Num_SKUs` and `Mgr_Tenure_Months` were not present in the
supplied file and are therefore treated as **omitted variables** — discussed
explicitly in the analysis's reflection section rather than silently ignored.

## Technologies Used

| Layer | Tools |
|---|---|
| Data analysis & modelling | Python 3.11, pandas, numpy, scikit-learn, statsmodels |
| Visualization (Python) | matplotlib, seaborn |
| Dashboard | HTML5 / CSS / JavaScript, Chart.js 4 (self-contained, no external dependencies at runtime) |
| Presentation | python-pptx (source deck), Playwright/Chromium (PDF export) |
| Reproducibility | Fixed random seed (`random_state=42`) throughout |

## Folder Structure

```
Project/
├── Python/
│   ├── analysis.py                     # main analysis script (run this)
│   ├── data/freshmart_store_sales.csv  # input data
│   ├── outputs/freshmart_predictions_residuals.csv
│   ├── generated charts/               # 6 PNG charts produced by analysis.py
│   ├── output screenshots/             # console-output screenshots
│   └── console_output.txt              # full run log
├── Dashboard/
│   ├── dashboard.html                  # interactive dashboard (open in any browser)
│   ├── dashboard.pdf                   # one-page static export
│   ├── dashboard screenshots/          # PNG captures incl. a filtered-state demo
│   ├── freshmart_predictions_residuals.csv
│   └── Dashboard_Documentation.md      # chart rationale, insights, recommendations,
│                                       # and a native Tableau/Power BI rebuild guide
├── Presentation/
│   ├── Presentation.pptx               # 16-slide deck with speaker notes
│   └── Presentation.pdf                # static export
└── README.md
```

## Steps to Run the Python Code

```bash
cd Project/Python
pip install pandas numpy scikit-learn statsmodels matplotlib seaborn
python analysis.py
```

The script is fully reproducible (`random_state=42` throughout) and runs
top-to-bottom with no manual edits. It will:

1. Load `data/freshmart_store_sales.csv` and print summary statistics.
2. Clean the data (missing-value/duplicate handling, IQR outlier scan).
3. Produce 6 charts into `outputs/figures/` (scatter plots, correlation
   heatmap, location/festival comparison, predicted-vs-actual, residual
   distribution, driver-importance tornado).
4. One-hot encode `Location_Type`, drop identifiers, split 75/25 train/test.
5. Fit a multiple linear regression (scikit-learn `LinearRegression` +
   statsmodels `OLS` for p-values).
6. Report R² / Adjusted R² / RMSE / MAE on the held-out test set, print a
   coefficient table with plain-language interpretation, and check
   multicollinearity via VIF.
7. Export per-store predictions/residuals to
   `outputs/freshmart_predictions_residuals.csv`.
8. Run a realistic what-if prediction scenario.
9. Print a written reflection on multicollinearity, omitted variables, and
   correlation vs. causation.

## Dashboard Description

`Dashboard/dashboard.html` is a self-contained, interactive dashboard (no
install, no internet connection needed — open the file directly in any
browser) covering all 10 required BI items:

1. KPI summary cards (avg sales, avg stockout rate, avg digital spend, store count)
2. Average sales by location (bar)
3. Digital ad spend vs. sales (scatter + trend line)
4. Stockouts vs. sales (scatter + trend line)
5. Driver correlation matrix (heatmap, recomputed live per filter)
6. Predicted vs. actual sales (scatter + 45° reference line)
7. Driver importance (standardized-coefficient tornado chart)
8. Festival-month uplift (bar)
9. Ad-channel mix vs. sales (grouped bar, sequential low/mid/high tercile ramp)
10. Residual distribution (histogram)

**Interactivity:** 3 working filters (Location_Type, Is_Festival_Month,
Parking_Available), a live what-if Digital Ad Spend slider driven by the
model's actual fitted coefficients, and click-to-drill from the location bar
chart. Every chart, KPI, and the correlation matrix recompute from the same
filtered slice, so the numbers always agree.

**A note on format:** this dashboard was built in a headless Linux
environment without Tableau Desktop or Power BI Desktop installed, so it is
delivered as an interactive HTML/JS file rather than a native `.twbx`/`.pbix`
— functionally equivalent, and simpler to demo (just open it in a browser).
`Dashboard_Documentation.md` includes a field-by-field guide for rebuilding
the same 10 items natively in Tableau or Power BI if a native file is
required for grading.

## Key Insights

1. **Location is the single biggest lever.** Metro stores out-sell Suburban
   stores by roughly Rs 750K/month in the model — a gap far larger than any
   plausible marketing reallocation could close.
2. **TV and Radio ad spend carry the ad-budget signal, not Digital.**
   Digital's strong raw correlation with sales (r ≈ 0.78) becomes
   statistically insignificant (p = 0.93) once TV and Radio are in the model
   — the three channels are highly collinear (VIF ≈ 4.5), so the regression
   cannot cleanly separate their individual effects.
3. **Stockouts are a quantifiable, controllable revenue leak.** Each 1-point
   rise in stockout rate costs ~Rs 11K/month per store (p < 0.001) — one of
   the few levers operations owns directly.
4. **Festival months add a reliable, budget-independent uplift** of ~Rs 90K,
   useful for inventory and staffing planning regardless of that month's ad
   spend.
5. **Model fit is solid but not precise:** test-set R² = 0.83 (Adj. R² =
   0.80), RMSE ≈ Rs 173K (~12% of average sales) — good enough to guide
   budget allocation, not precise enough for store-level payroll decisions.

## Recommendations

1. Rebalance ad budget from Digital toward TV/Radio for digital-heavy
   stores, pending a controlled test.
2. Fund stockout reduction before further ad-spend increases — cutting
   stockout rate from ~15% to ~5% is worth an estimated ~Rs 112K/month per
   store.
3. Prioritize new-store investment in Metro/Urban catchments over Suburban
   at parity spend.
4. Plan inventory and staffing around festival months using the ~Rs 90K
   predictable uplift as a baseline.

## Limitations (see also the analysis's printed reflection)

- **Multicollinearity** among ad-spend channels inflates individual
  coefficient standard errors (see VIF table).
- **Omitted variables:** only 8 of the 20 documented predictors were
  available in the supplied data file (see Project Overview above).
- **Correlation vs. causation:** ad-spend coefficients show association, not
  proof of a causal effect — budget allocation itself may already be
  correlated with expected store performance.

## Conclusion

A multiple linear regression on 8 available business drivers explains 83% of
test-set variance in FreshMart's monthly sales. The headline answer to the
project's core question: **location and operational execution (stockout
rate) explain more of the sales gap between stores than any single
advertising channel does.** Digital ad spend's apparent effect is largely a
multicollinearity artifact rather than a proven independent driver — any
digital-budget decision should be treated as a hypothesis to test (e.g., via
a controlled experiment), not a conclusion to act on from this model alone.

## Assumptions Log

- Data file used carries 8/20 documented predictors (see above).
- Missing values: none found; defensive median/mode imputation code included
  but not triggered.
- Outliers: retained (report-only IQR scan); no rows deleted.
- Train/test split: 75/25, `random_state=42`.
- Categorical encoding: one-hot, `drop_first=True` (Metro is the reference
  level for `Location_Type`).
- No feature scaling on the reported model (coefficients stay in native
  business units); a separately standardized fit is used only to rank driver
  importance.
- Team member names, course/section, and presentation date are left as
  placeholders in `Presentation.pptx`/`.pdf` (Slide 1) for the group to fill
  in — these were not part of the provided project materials.
- Dashboard delivered as interactive HTML/JS in place of a native
  `.twbx`/`.pbix` file, since Tableau/Power BI Desktop are not available in
  this build environment (see Dashboard Description above and
  `Dashboard/Dashboard_Documentation.md` for the native rebuild guide).
