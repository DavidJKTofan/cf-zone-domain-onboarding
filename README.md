# Cloudflare Zero-Downtime Migration Guide

Interactive TypeScript guide for migrating domains to Cloudflare with zero downtime using Partial (CNAME) Setup. Built as a Cloudflare Worker with static assets.

## Project Structure

```
.
├── src/
│   ├── index.ts              # Worker entry point (API routes)
│   ├── migration-steps.ts    # Migration workflow definitions
│   └── types.ts              # TypeScript type definitions
├── public/
│   ├── index.html            # Main HTML structure
│   ├── styles.css            # Application styles
│   └── scripts.js            # Frontend logic
├── wrangler.jsonc            # Worker configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

### Architecture

- **Backend**: Cloudflare Worker serving API endpoints (`/api/steps`, `/api/documentation`)
- **Frontend**: Vanilla JavaScript SPA with step-based workflow
- **State**: Browser localStorage for checkpoint persistence
- **Assets**: Static files served via Workers Assets binding

## Migration Workflow

The guide covers 13 steps across three phases:

1. **Phase 1: Partial Setup (Testing)** - Add zone, configure SSL/TLS, create DNS records, test with `/etc/hosts`
2. **Phase 2: Full Setup Migration** - Handle DNSSEC, convert to full setup, update nameservers
3. **Phase 3: Enable Proxy** - Enable orange cloud, route traffic through Cloudflare

Each step includes required/optional checkpoints, descriptions, and links to official Cloudflare documentation.

## Quick Start

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/DavidJKTofan/cf-zone-domain-onboarding)

## Features

- **Interactive Checkpoints** - Track progress with required/optional validation
- **State Persistence** - Auto-save progress in browser localStorage
- **Responsive Design** - Responsive UI for desktop and mobile
- **Official Documentation** - Direct links to Cloudflare docs for each step
- **Modular Architecture** - Easy to extend with new migration workflows

## API Endpoints

- `GET /api/steps` - Returns all migration steps with checkpoints
- `GET /api/documentation` - Returns categorized documentation links

## Key Resources

- [Minimize Downtime](https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/)
- [Partial (CNAME) Setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/)
- [Convert Partial to Full Setup](https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/)
- [Securely deliver applications with Cloudflare](https://developers.cloudflare.com/reference-architecture/design-guides/secure-application-delivery/)

## Image Guidelines

- **Format**: PNG or JPEG
- **Size**: Recommended width 800-1200px
- **Content**: Clear screenshots from Cloudflare dashboard or relevant configuration screens
- **Quality**: High resolution, clearly readable text
- **Annotations**: Add arrows, highlights, or text to draw attention to important elements

The frontend will automatically display these images if they exist, or show a placeholder if missing.

## Customization

**Migration Steps:** Edit `src/migration-steps.ts` to add, modify, or remove migration steps. The modular structure makes it easy to create custom workflows for different use cases.

**Dashboard Deep Links:** Add the optional `dashboardLink` field to any step to display a prominent button that links directly to the relevant Cloudflare Dashboard page. Example:
```typescript
dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/records'
```

**Progress Bar:** Edit `public/scripts.js` to exclude steps from progress bar progression that only have optional checkpoints, like Step 6 and 14.

# Disclaimer

This tool is provided for educational and informational purposes only. 

It is the user's responsibility to thoroughly review all configurations, verify DNS records, and validate SSL/TLS certificates before and after migration. Always test in non-production / staging environments first. The authors assume no liability for any issues arising from the use of this guide.