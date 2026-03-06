# NHS England A&E Crisis — Machine Learning Analytics Report

> **Machine Learning-Driven Demand Forecasting & Strategic Intervention Analysis**
> MSc Business Analysis & Consulting · University of Strathclyde
> Analysis Period: January 2022 – January 2026 (49 Months)
> Regions: Midlands · London · North East & Yorkshire

---

## Executive Summary

The NHS England A&E system is in structural failure. Across 49 consecutive months,
the 4-hour treatment target was missed **zero times** — with breach rates peaking at
**46.16%**, more than 9× above the NHS 5% threshold. This project applies machine
learning forecasting and multi-criteria decision analysis to diagnose root causes,
predict future demand, and prioritise the interventions most likely to reduce system
pressure.

**The model achieved 96.33% forecasting accuracy (3.67% MAPE)** using a Random Forest
trained on 17 engineered features — enabling 12-month forward planning with
quantified confidence.

---

## The Problem at a Glance

| Metric | Value | Context |
|---|---|---|
| Peak Breach Rate | 46.16% | December 2023 — 9.2× above NHS 5% target |
| Target Achievement | 0 / 49 months | Zero months met the 4-hour standard |
| Attendance Growth | +21.8% | 608,643 → 741,357 over 49 months |
| Peak 12+ Hour Waits | 36,653 | January 2026 — whole-hospital capacity failure |
| Peak 4–12 Hour Waits | 300,047 | December 2023 — internal A&E flow failure |

---

## Five Bottlenecks Identified

**Bottleneck 1 — Demand Surge**
A&E Type 1 attendances grew 21.8% over the analysis period with a clear seasonal
wave pattern repeating every winter. The baseline is rising year-on-year, meaning
the system handles more patients each cycle with no proportional capacity increase.

**Bottleneck 2 — Performance Crisis**
The 4-hour breach rate averaged 38–40% across the dataset — 9× above the NHS target.
No month came close to compliance. This is not a local issue; it is systemic across
all three regions.

**Bottleneck 3 — Wait Time Escalation**
Two distinct failure modes exist with different root causes and different peak dates.
4–12 hour waits reflect internal A&E flow failures. 12+ hour waits reflect
whole-hospital exit block. They require separate interventions — not a single
combined budget.

**Bottleneck 4 — Regional Inequality**
Midlands carries the highest volume across all 49 months. London shows lower Type 1
volumes, partly attributable to Urgent Treatment Centre infrastructure deflecting
lower-acuity demand. NE&Y sits between both. Funding allocation must reflect this
hierarchy.

**Bottleneck 5 — Predictable Seasonal Crisis**
24 of 49 months (49%) were classified as high pressure. These cluster almost entirely
in October–February every single year. The winter surge is not an emergency — it is
a predictable event being treated as one.

---

## Machine Learning Model

### Why Random Forest

Three candidate models were evaluated against four criteria: ability to handle
nonlinear patterns, multi-feature capability, overfitting risk, and interpretability.

| Model | Nonlinear | Multi-Feature | Overfitting Risk | Decision |
|---|---|---|---|---|
| ARIMA | No | No | Low | Rejected |
| Gradient Boosting | Yes | Yes | High | Rejected |
| **Random Forest** | **Yes** | **Yes** | **Low** | **Selected** |

Trend analysis revealed the relationship between inputs and attendance is nonlinear —
small demand increases produce disproportionately large breach rate spikes. This ruled
out ARIMA before any model was run. Gradient Boosting was rejected due to high
overfitting risk on a 49-month dataset. Random Forest was selected because it matched
all four criteria simultaneously.

### Model Performance

| Metric | Value | Interpretation |
|---|---|---|
| Accuracy | 96.33% | Excellent predictive precision |
| MAPE | 3.67% | Mean error of ~25,700 patients per month |
| CV Average | 3.37% | Confirms no overfitting |
| Features | 17 | Engineered predictor variables |

The proximity of CV Average (3.37%) to test MAPE (3.67%) is the key validation
signal — confirming the model generalises to unseen months rather than memorising
training data.

### Feature Importance

| Rank | Feature | Importance | What It Captures |
|---|---|---|---|
| 1 | Emergency Admissions | 56.09% | Whole-hospital capacity strain and exit block |
| 2 | Lag_12 | 19.48% | Same month last year — annual seasonal signal |
| 3–17 | Seasonal flags, Lag_4, regional identifiers | 24.43% | Supporting context |

**Lag_12:** A&E demand repeats its seasonal pattern annually. What happened last
October predicts this October more powerfully than any short-term trend signal.

**Emergency Admissions:** When hospital beds are full, patients cannot leave A&E.
This captures whole-system pressure before it translates into breach rates — making
it the strongest leading indicator in the dataset.

### Data Splitting

The dataset was split **chronologically — never randomly** to prevent data leakage.
Training on future months to predict the past produces artificially inflated accuracy
and a model that fails in real deployment.

- **Training set:** First ~39 months (80%)
- **Test set:** Final ~10 months (20%)
- **Validation:** Walk-forward time series cross-validation

Walk-forward cross-validation was used because each fold must train only on past data
and test only on future data — replicating real deployment conditions exactly.

---

## Strategic Recommendations

Six interventions were scored across four weighted criteria using Multi-Criteria
Decision Analysis (MCDA).

| Weight | Criteria |
|---|---|
| 35% | Clinical Impact |
| 25% | Operational Feasibility |
| 25% | Strategic Alignment |
| 15% | Economic Efficiency |

### Final Rankings

| Rank | Intervention | Score | Priority |
|---|---|---|---|
| 1 | Seasonal Resourcing | 21.31 | Immediate |
| 2 | Volume-Weighted Regional Allocation | 18.63 | High |
| 3 | UTC Pathways Expansion | 18.45 | High |
| 4 | Front-Door Flow Management | 18.40 | Parallel |
| 5 | Exit Block Resolution | 15.99 | Parallel |
| 6 | Estate Expansion | 12.58 | Conditional |

### Three Priority Actions

**1. Seasonal Resourcing — Immediate**
Unlock funding in September before the October surge. The model forecasts 696,464
attendances in October 2026. Resources must be pre-positioned before the peak —
not reactively deployed during it.

**2. Volume-Weighted Regional Allocation — High Priority**
Prioritise Midlands, then NE&Y, then London. Allocate acute clinical resources
proportionally to volume hierarchy — not equally across regions.

**3. UTC Pathways Expansion — High Priority**
Replicate London's Urgent Treatment Centre model in Midlands and NE&Y to deflect
lower-acuity demand away from Type 1 departments. Pilot in one Midlands trust
before full rollout.

---

## Key Limitations

**Sample Size:** 49 monthly observations is a constrained dataset. Cross-validation
mitigates overfitting risk but a larger dataset would produce more robust estimates.

**Regional Scope:** Three regions represent significant NHS England A&E volume but
findings require separate validation before application to other regions.

**Type 1 Only:** Analysis covers Type 1 departments exclusively. Type 3 UTC data
was not included — creating a blind spot for the UTC expansion recommendation.

**Confounding Variables:** London's lower Type 1 volumes reflect multiple structural
differences beyond UTC provision. UTC contribution cannot be isolated from this
analysis alone and requires a difference-in-differences study for confirmation.

---

## Methodological Notes

Random Forest feature importance scores represent one training run on this specific
dataset. Emergency Admissions would reliably rank first across retraining runs — the
precise 56.09% figure is a strong directional signal, not a fixed truth.

MCDA weights were derived from NHS England Long Term Plan priorities. A sensitivity
analysis varying weights by ±10% is recommended before operational adoption, as
different stakeholder groups would apply different weights and could produce different
intervention rankings.

---

## Data Source

NHS England A&E Attendances and Emergency Admissions Statistics
https://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/

---

## Academic Context

University of Strathclyde · MSc Business Analysis & Consulting
Case Study 5 — NHS England A&E Crisis
