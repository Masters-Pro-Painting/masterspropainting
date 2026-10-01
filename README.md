# Master's Pro Painting Inc — website

Live site: https://masterspropaint.com (email stays on masterspropaintinginc.company)
Built with [Astro](https://astro.build). Hosted on Netlify.

**Publishing today:** the repo is not linked in Netlify yet, so a push to `main` does not publish. Run `npm run deploy` for a private draft, or `npm run deploy -- --publish` to go live. It builds with the settings in `netlify.toml` and refuses to publish a build with tracking missing or hidden from Google. A draft is the same build as live. Tracking only runs on masterspropaint.com, so opening a draft link sends nothing to GA4 or Google Ads. After a publish, `node scripts/verify-live.mjs` checks the live site without sending a lead. It needs a Netlify access token in `.env.vlad` (never committed). Once the repo is linked in Netlify, every push to `main` publishes by itself.

## Edit something

| What | File |
|---|---|
| Phone, address, hours, license, prices, social profiles | `src/data/site.ts` |
| Google reviews shown on the site | `src/data/reviews.ts` |
| Service pages (copy, FAQs, photos) | `src/data/services.ts` |
| Service area pages | `src/data/areas.ts` |
| Photo alt text | `src/data/photos.ts` (photos live in `src/assets/photos/`) |
| Homepage | `src/pages/index.astro` |
| Old-URL redirects | `public/_redirects` |
| Tracking IDs, indexing switch | `netlify.toml` |

Every service, area and landing page must show exactly 8 different photos. The build fails if not.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
npm run qa       # checks every built page
```

Node 22.12 or newer.

## Forms

The estimate form is a Netlify Form named `estimate`. `scripts/form-contract.mjs` runs after every build and fails it if the form name or any field name changes, because Zapier maps them by name. Netlify stores every submission and emails the notification list. Zapier's Netlify "New Form Submission" trigger sends each lead to DripJobs. Hidden fields carry the page, UTM tags and Google click IDs.

## Tracking

Set in `netlify.toml`. All values are public IDs:

- `PUBLIC_GA4_ID` — GA4 measurement ID (`G-…`). Sends page views, `generate_lead` and `click_to_call`.
- `PUBLIC_ADS_ID` — Google Ads tag ID (`AW-…`).
- `PUBLIC_ADS_FORM_LABEL` — label of the "Website Form Lead" conversion. Fires after a successful form submit, with enhanced conversions for leads (phone number, hashed by Google's tag).
- `PUBLIC_ADS_CALL_LABEL` — label of the "Website Calls 60s+" conversion. Swaps in a Google forwarding number for ad visitors.

## Going live / indexing

`PUBLIC_STAGING = "true"` in `netlify.toml` keeps the whole site out of Google. Set it to `"false"` once the domain points at Netlify.
