# HabitBloom Premium Specification

## 1. Overview
HabitBloom Premium introduces "Advanced Growth Insights", a deterministic intelligence layer built to provide deeper visibility into long-term habit patterns.

## 2. Supported Periods
The Premium Dashboard allows comparing performance across multiple lookback windows:
- **14 Days:** Short-term trend detection.
- **30 Days:** Standard monthly comparison.
- **60 Days:** Medium-term trajectory.
- **90 Days:** Long-term seasonal change.

## 3. Data Requirements
Advanced Growth Insights relies entirely on existing habit logs. 
- **Insufficient Data Protection:** If a user has fewer days of history than the selected period requires (e.g., trying to view 90-day trends with only 45 days of usage), the engine strict-returns an `INSUFFICIENT_DATA` state.
- **Fake Analytics Prevention:** No data is padded or assumed. Empty states clearly communicate that more history is required.

## 4. Available Patterns
The system detects the following historical patterns deterministically:
- **Weekend Drop-off / Strong Weekends:** Based on ratio of weekday vs weekend completions over the last 30 days.
- **Highest Consistency (Best Period):** Analyzes the last 6 months to find the calendar month with the highest overall completion rate.

## 5. Feedback Behavior
A lightweight feedback component is included in the dashboard.
- Users can rate the insight as: *Very useful*, *Useful*, or *Not useful*.
- Emits `premium_feedback_submitted` with the rating and `feature: "advanced_insights"`.
- Deduplication: State is tracked in the component (`feedbackSubmitted`) to prevent double-logging.

## 6. Access Control
Access is centrally managed via `lib/featureAccess.ts`.
- **EARLY_ACCESS:** Grants full access without prompting for payment.
- **PREMIUM:** Grants full access.
- **FREE:** Shows the `PremiumInterestPreview`.

## 7. Known Limitations
- The current implementation of `Highest Consistency` relies on calendar months rather than sliding windows to prioritize performance.
- The trend engine does not currently weight habit difficulty.

## 8. 2027 Preparation
- No billing endpoints or checkout flows have been introduced.
- The Phase 12 objective is validating whether Early Access users return to this dashboard and find value in it over multiple sessions.
