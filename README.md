# Zero Impression Cleaner

A Google Ads Script that identifies keywords with zero impressions over a configurable lookback window and pauses them to keep your account clean.

## What It Does

- Finds enabled keywords in enabled ad groups and campaigns with zero impressions
- Pauses them and applies a label for easy filtering and recovery
- Sends an email notification with the count and a sample of paused keywords
- Configurable minimum keyword age to avoid pausing newly added keywords

## Setup

1. In Google Ads, go to **Tools & Settings > Bulk Actions > Scripts**
2. Paste the contents of `main_en.gs` (or `main_fr.gs` for French)
3. Update the `CONFIG` values
4. Set `TEST_MODE` to `false` when ready
5. Schedule the script weekly

## CONFIG Reference

| Parameter              | Type    | Default                  | Description                                          |
|------------------------|---------|--------------------------|------------------------------------------------------|
| `TEST_MODE`            | Boolean | `true`                   | When true, counts but does not pause                 |
| `NOTIFICATION_EMAIL`   | String  | —                        | Email for the pausing report                         |
| `LOOKBACK_WINDOW`      | String  | `LAST_30_DAYS`           | Date range to check for zero impressions             |
| `LABEL_NAME`           | String  | `Paused_Zero_Impression` | Label applied to paused keywords                     |
| `MIN_KEYWORD_AGE_DAYS` | Number  | `14`                     | Minimum keyword age — younger ones are skipped       |

## How It Works

1. Queries all enabled keywords with zero impressions in the lookback window
2. Applies tracking label and pauses each keyword
3. Sends email with total count and sample list

## Recovering Paused Keywords

Filter by label `Paused_Zero_Impression` in Google Ads, select and re-enable.

## Requirements

- Google Ads account with Search campaigns
- Google Ads Scripts access

## License

MIT — Thibault Fayol Consulting
