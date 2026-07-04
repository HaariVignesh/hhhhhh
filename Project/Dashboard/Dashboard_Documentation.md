# FreshMart Sales Dashboard — Design Rationale, Insights & Recommendations

## 1. What this is and an important assumption

`dashboard.html` is a self-contained, interactive dashboard covering all 10 required
items from the project brief. It was built as an HTML/JS dashboard rather than a
native Tableau `.twbx` or Power BI `.pbix` file because **this analysis was produced
in a headless Linux environment with no Tableau Desktop or Power BI Desktop
installed** (both are Windows/Mac GUI applications). The HTML dashboard is
functionally equivalent — same 10 chart requirements, same filters, same
what-if control — and opens in any browser with no install step, which also makes
it easier to demo live during the presentation.

If your grading strictly requires the native file, Section 6 below is a field-by-field
guide to rebuild the same dashboard in Tableau or Power BI in well under an hour.

Data note: the dashboard is built on `freshmart_predictions_residuals.csv`, which
carries 8 of the 20 predictors documented in the project's data dictionary
(`Location_Type`, `Is_Festival_Month`, `Parking_Available`, the four ad-spend
channels, and `Stockout_Rate_pct`). See the Python analysis's reflection section
for the omitted-variable discussion this implies.

## 2. Why each visualization was chosen

| # | Chart | Why this form |
|---|-------|---------------|
| KPI cards | 4 stat tiles (cards) | A single number read instantly beats a chart when the question is "what is the value," not "how does it vary" — the brief's required headline snapshot. |
| 1. Avg sales by location | Bar chart | Location is categorical (3 levels) and the question is magnitude comparison across categories — bar is the correct form; a line or scatter would wrongly imply order/continuity. |
| 2. Festival uplift | Bar chart (2 categories) | Same logic — a binary category compared on one continuous measure. A box plot was considered but a bar keeps the "uplift" reading immediate, which is what the audience needs; per-store spread is already visible in the residual chart. |
| 3. Digital ad spend vs sales | Scatter + trend line | Two continuous variables → scatter is the only form that shows the actual shape of the relationship (not just its average), and the fitted trend line quantifies the direction the audience will ask about. |
| 4. Stockouts vs sales | Scatter + trend line | Same reasoning as #3, negative direction. |
| 5. Driver correlation matrix | Heatmap (diverging blue↔red) | 8 variables × 8 variables is too dense for any other form; a heatmap lets a reader scan for both the strongest positive (blue) and negative (red) relationships in one glance. Diverging color (not a rainbow) because correlation has a true zero midpoint. |
| 6. Driver importance | Horizontal tornado bar | Ranking signed effects by magnitude is exactly what a sorted horizontal bar is for — vertical bars would need rotated labels for 9 long feature names. |
| 7. Predicted vs actual | Scatter + 45° reference line | The reference line gives an instant visual test of fit — points hugging the line are well-predicted; the diagonal has no other honest chart equivalent. |
| 8. Residual distribution | Histogram | Distribution shape (centered? skewed? long tail?) is a histogram's job — a stat tile would hide skew, a scatter would hide the density. |
| 9. Ad-channel mix vs sales | Grouped bar, low/mid/high spend tercile per channel, **single-hue sequential ramp** | This is an ordinal comparison (low→high spend within a channel), not four unrelated categories, so per the visualization system's color rules it uses one hue ramping light→dark rather than arbitrary qualitative colors (which would wrongly imply "good/bad" categories instead of "less/more"). |

## 3. Interactivity implemented

- **3 required filters**: Location_Type (Metro/Urban/Suburban), Is_Festival_Month
  (Festival/Non-festival), Parking_Available (Yes/No) — a single filter row above
  all charts, so every chart, KPI, and the correlation matrix always agree on the
  same slice (per dataviz interaction rules).
- **What-if parameter**: a Digital Ad Spend slider (Rs 0–80K) recomputes a live
  sales prediction using the fitted regression's actual coefficients, holding every
  other driver at the current filtered slice's average (or the filter's own value,
  if a filter is active) — this is a genuine model-driven what-if, not a cosmetic
  slider.
- **Drill-down**: clicking a bar in "Average Sales by Location" sets the Location
  filter to that bar (click again to clear) — cross-filtering the whole dashboard
  from a single click.
- **Self-scoping charts**: the two charts whose own dimension is also a filter
  (location, festival) deliberately ignore their own filter so they always show a
  full comparison, even while highlighting the selected category — otherwise
  filtering to "Metro" would collapse the location-comparison chart to a single
  bar, defeating its purpose.
- **Live recomputation, not pre-baked slices**: the correlation matrix, trend
  lines, KPI averages, and ad-channel terciles are all recalculated in the browser
  from the filtered rows on every interaction, not stored per-combination —
  so any combination of filters produces correct numbers.

## 4. Key findings (from the model and the dashboard)

1. **Location dominates every other driver.** Metro stores average roughly
   Rs 750K/month more than Suburban stores — a gap larger than any plausible
   marketing reallocation could close.
2. **Digital ad spend's strong raw correlation (r ≈ 0.78) mostly evaporates in the
   multivariate model.** TV and Digital spend move together (stores with big
   overall marketing budgets buy more of both), so once TV is in the model,
   Digital's own coefficient is small and not statistically significant
   (p = 0.93). TV and Radio are the channels the model credits with an
   independent effect.
3. **Stockouts are a directly actionable, statistically significant lever**
   (p < 0.001): each 1-point rise in stockout rate costs ~Rs 11K/month per store.
4. **Festival months add a reliable, budget-independent uplift** of ~Rs 90K,
   useful for inventory/staffing planning regardless of that month's ad spend.
5. **Model fit is good but not perfect**: test-set R² = 0.83, RMSE ≈ Rs 173K
   (~12% of average sales) — solid enough to guide budget allocation decisions,
   not precise enough to set individual store targets or payroll.

## 5. Recommendations

1. **Shift incremental ad budget from Digital toward TV/Radio** for stores that
   are currently Digital-heavy — pending a proper controlled test, since Digital's
   apparent lift looks like it's riding on overall budget size rather than its own
   channel effect (see multicollinearity note).
2. **Fund stockout reduction before further ad-spend increases.** Cutting
   stockout rate from ~15% to ~5% is worth an estimated ~Rs 112K/month per
   store — often a cheaper lift than an equivalent gain from advertising.
3. **Prioritize new-store investment in Metro/Urban catchments** over Suburban
   at parity spend — the location effect compounds with every other driver in
   the model.
4. **Plan inventory and staffing around festival months** using the ~Rs 90K
   predictable uplift as a baseline, independent of that month's marketing spend.

## 6. Rebuilding this dashboard natively in Tableau / Power BI

Data source for all items: join `freshmart_predictions_residuals.csv` on
`Store_ID` (already contains `Predicted_Sales_K` and `Residual` — no separate
join needed since they're already columns in this file).

| # | Item | Tableau | Power BI |
|---|------|---------|----------|
| KPI | Cards | 4 "Text" worksheets with AVG(Monthly_Sales_K), AVG(Stockout_Rate_pct), AVG(Digital_Ad_Spend_K), COUNTD(Store_ID), placed in a horizontal container | 4 Card visuals with the same 4 measures |
| 1 | Bar | Rows: Location_Type, Columns: AVG(Monthly_Sales_K), sort descending | Clustered column chart, Axis=Location_Type, Value=Average of Monthly_Sales_K |
| 2 | Bar/Box | Rows: Is_Festival_Month, Columns: AVG(Monthly_Sales_K) | Column chart, Axis=Is_Festival_Month, Value=Average Monthly_Sales_K |
| 3 | Scatter+trend | Columns: Digital_Ad_Spend_K, Rows: Monthly_Sales_K, Analytics pane → Trend Line (linear) | Scatter chart, X=Digital_Ad_Spend_K, Y=Monthly_Sales_K, enable trend line in Analytics pane |
| 4 | Scatter+trend | Same as #3 with Stockout_Rate_pct on Columns | Same as #3 with Stockout_Rate_pct on X |
| 5 | Heatmap | Use a calculated correlation table (or Tableau's built-in scatterplot matrix extension) across the 8 numeric fields | Matrix visual with conditional-formatting background color on a precomputed correlation table, or an R/Python visual |
| 6 | Tornado bar | Bar chart of a manually-entered/joined standardized-coefficient table (from `analysis.py` output), sorted, split colors by sign | Same, using a small supplementary table of coefficients as its own data source |
| 7 | Scatter+45° | Columns: Monthly_Sales_K, Rows: Predicted_Sales_K, add a reference line/band at y=x via a calculated field | Scatter chart X=Monthly_Sales_K, Y=Predicted_Sales_K, add a calculated "y=x" line series |
| 8 | Histogram | Rows: CNT(Store_ID), Columns: Residual binned (right-click → Create Bins) | Histogram visual (or column chart) on Residual with binning |
| 9 | Grouped bar | Calculated field bucketing each ad-spend column into terciles (Low/Mid/High) per channel, then Rows=Channel, Columns=Tercile, Color=Tercile (sequential ramp) | Same bucketing via a calculated column (DAX `SWITCH`/`RANKX`), clustered column chart |
| Filters | 3 quick filters | Add Location_Type, Is_Festival_Month, Parking_Available as Filters, apply to all worksheets using this data source | Add as Slicers and set "Sync slicers" across all report pages |
| What-if | Parameter | Create a Tableau Parameter (0–80, step 1) for Digital_Ad_Spend_K, use a calculated field with the regression coefficients to project sales, display as a text box driven by the parameter | Create a What-If parameter in Power BI (Modeling → New Parameter), reference it in a DAX measure using the same coefficients |

Regression coefficients needed for the calculated "what-if" field (from
`analysis.py`, training-set fit): Intercept = 1481.52; Is_Festival_Month = 90.75;
Parking_Available = 35.65; Digital_Ad_Spend_K = 0.16; TV_Ad_Spend_K = 6.40;
Radio_Ad_Spend_K = 7.95; Print_Ad_Spend_K = −0.43; Stockout_Rate_pct = −11.16;
Location_Type_Suburban = −753.63; Location_Type_Urban = −383.47 (Metro is the
dropped reference level).
