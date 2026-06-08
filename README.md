# QA F9 – Platform Playwright UI Smoke

**Requirement:** RQ071082  
**Campaign:** qa-F9-2026-06-08  
**Target:** https://agentos.aqua-cloud.io/

## Summary

| Check | Result |
|---|---|
| Landing page rendered | ✅ Yes |
| Page title | `aqua intelligence Agent OS` |
| Rebrand confirmed | ✅ Yes |
| Fleet page rendered | ✅ Yes |
| Items page rendered | ✅ Yes |
| Console errors | 1 (benign — basic-auth URL / History API mismatch) |
| **Overall** | **✅ PASS** |

## Console Error Detail

```
SecurityError: Failed to execute 'replaceState' on 'History': A history state object with URL
'https://agentos.aqua-cloud.io/ui/' cannot be created in a document with origin
'https://agentos.aqua-cloud.io' and URL 'https://qa:dquzft5gHtnSinpckNRv@agentos.aqua-cloud.io/ui/'.
```

This error is a **known, benign browser security restriction** triggered purely by the
credentials-in-URL form of the base URL. The SPA itself functions correctly (all three pages
rendered and screenshots captured). The error does not represent a product defect.

## Screenshots

Screenshots captured during the run (attached to RQ071082):

- `landing.png` — landing/home (Fleet view, which is the default route)
- `smoke/screenshots/fleet.png` — Fleet page
- `smoke/screenshots/items.png` — Items page

## Running locally

```bash
cd smoke
npm install
PLAYWRIGHT_BROWSERS_PATH=/opt/playwright-browsers node smoke.js
```
