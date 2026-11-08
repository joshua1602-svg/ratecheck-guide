# RateCheck search discovery experiment — November 2026

## Hypothesis

The publicly available VOA valuation data and RateCheck's existing free comparison tool may attract users who search for a second opinion on their 2026 rateable value. Validate **qualified assessment completions and purchased reports**, not keyword rankings alone.

### Primary source

User-supplied Google Keyword Planner CSV: `Keyword Stats 2026-11-08 at 16_00_43.csv`, historical period October 2025–September 2026. It contains 463 keyword rows. The export uses GBP for the advertiser currency; **GBP does not establish that the geographic search filter was the UK**. Search volumes are rounded and close variants can overlap.

| Query | Estimated monthly searches | YoY | Ads competition | High-range bid (GBP) | Buyer intent |
| --- | ---: | --- | --- | ---: | --- |
| business rates checker | 50,000 | +900% | Low | 4.01 | Often navigational toward GOV.UK; some independent comparison intent |
| voa business rates checker | 50,000 | +900% | Low | 4.33 | Mostly official service intent; do not imply RateCheck is the VOA |
| business rates calculator | 5,000 | 0% | Low | 4.13 | Rates payable calculation, **not** RateCheck's current valuation comparison |
| rateable value checker | 5,000 | 0% | Low | 4.26 | Best conceptual fit for the existing offering |
| find rateable value | 5,000 | 0% | Low | 4.26 | Official lookup/navigation |
| challenge business rates | 500 | 0% | Medium | 9.09 | Potentially high commercial intent; user must follow official Check → Challenge process |
| business rate relief calculator | 500 | 0% | Low | 4.79 | Current RateCheck does **not** check relief eligibility |
| business rates reduction companies | 50 | 0% | Medium | 15.49 | Higher purchase intent, much lower volume |

Do not sum these volumes. Reported +900% may reflect taxonomy or demand shifts; it is not proof of 10x growth in customers.

## Changes in this pilot

1. Fix homepage canonical to https://ratecheck.uk/ and set accurate title, description and structured WebApplication metadata.
2. Supply crawlable homepage fallback text before the React app loads.
3. Add static, crawlable guide pages for rateable-value checking and the formal challenge process, each referencing GOV.UK and linking to the existing free check.
4. Link guides from the React landing page and create `sitemap.xml` and `robots.txt` with OAI-SearchBot eligibility.
5. Correct the form input wording from annual rates **bill** to **rateable value** to match the `voa_rv` payload.

All content must continue to make clear RateCheck is an independent, indicative valuation comparison service. It is **not** a rates-payable calculator, relief checker, government service or authorised appeals agent.

## Required before deployment

- Confirm `ratecheck.uk` is the canonical live property and any other domains redirect to it.
- Verify the existing calculator/VOA data source and financial output semantics. Backend `api/services/savings.py` has a flat 0.49 estimated multiplier and a fixed 2026-07-31 cycle switch; those assumptions need review independently of SEO.
- Confirm Vite build/lint/tests, deployed `robots.txt` and `sitemap.xml`, guide URLs, page status codes and responsive rendering.
- Confirm what is actually rendered without JavaScript and how Google sees the HTML.
- Confirm data protection and consent messaging before tracking personal conversions. Review free check's email requirement; competitors may offer a no-email first step.
- Set up Google Search Console for the verified domain and submit sitemap; enable GA4 or a privacy-reviewed analytics implementation if required.
- Test that contact and paid-report routes remain unchanged.

## Measuring the 60–90 day experiment

Weekly record:
- Search Console non-branded impressions/clicks split by page and query.
- Organic sessions to the two guide pages and home page.
- Guide → free-check clicks.
- Free-check starts, completed assessments, and purchased reports **by origin**.
- Search/AI referrals separated from paid or outbound traffic.
- Any third-party AI citations (qualitative only; not a guaranteed placement or deterministic rank).

First 30 days: verify indexation, technical accessibility and correct tracking.
Day 60: compare organic traffic and completion rates, fix bottlenecks.
Day 90: continue only if there is a plausible trend in **qualified assessments / revenue** or a repeatable cost-efficient acquisition route. Zero leads with zero indexed impressions is inconclusive.

## Official sources

- https://www.gov.uk/find-business-rates
- https://www.gov.uk/introduction-to-business-rates/how-your-rates-are-calculated
- https://www.gov.uk/government/collections/how-to-challenge-your-business-rates-valuation
- https://help.openai.com/en/articles/12627856

## MCP note

An MCP tool does not automatically place RateCheck in ChatGPT search results. The separate RateCheck backend branch `experiment/ratecheck-mcp-public-readonly-2026` includes a *local-only*, read-only prototype for public service information and preparing an on-site check. Production integration requires consent, authentication, server hardening and explicit client installation/distribution.
