# Cloudflare Onboarding Guides

Interactive TypeScript guides for onboarding to Cloudflare products. Built as a Cloudflare Worker with static assets, designed to be modular, scalable, and mobile-responsive.

**Currently available:**
- **Application Services**
  - Zero-Downtime Domain Migration (Partial to Full Setup)
  - Cloudflare for SaaS & Custom Hostnames (vanity domains)
- **Cloudflare One** - SASE & Zero Trust Onboarding (VPN replacement, SWG, ZTNA)

## Project Structure

```
.
├── src/
│   ├── index.ts              # Worker entry point (routing & API)
│   ├── migration-steps.ts    # Legacy migration steps (deprecated)
│   ├── types.ts              # TypeScript type definitions
│   └── guides/
│       ├── index.ts          # Guides module exports
│       ├── types.ts          # Guide type definitions
│       ├── registry.ts       # Guide categories registry
│       ├── application-services/
│       │   ├── zero-downtime-migration.ts
│       │   └── cloudflare-for-saas.ts
│       └── cloudflare-one/
│           └── sase-onboarding.ts
├── public/
│   ├── index.html            # Landing page (homepage)
│   ├── guide.html            # Guide page template
│   ├── styles.css            # Application styles (responsive)
│   ├── landing.css           # Landing page styles
│   ├── scripts.js            # Frontend logic (MigrationGuide class)
│   └── img/                  # Step images by category
│       ├── application-services/
│       └── cloudflare-one/
├── wrangler.jsonc            # Worker configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Architecture

### Backend (Cloudflare Worker)
- TypeScript-based Worker with routing for landing page, guides, and API endpoints
- Static assets served via Workers Assets binding
- Modular guide system for easy extensibility

### Frontend (Vanilla JavaScript SPA)
- Step-based workflow with checkbox progress tracking
- State persistence in browser localStorage (per guide)
- Mobile-responsive design with CSS media queries
- Guide-specific warnings and command examples

### Routing
- `/` - Landing page with guide categories
- `/guide/:slug` - Individual guide pages
- `/api/steps/:slug` - Steps for specific guide
- `/api/guides` - All guide categories
- `/api/guides/:slug` - Specific guide metadata
- `/api/documentation` - Categorized documentation links

## Cloudflare One (SASE & Zero Trust) Guide

The SASE onboarding guide covers 19 steps across 7 phases:

### Phase 0: Preparation
1. **Planning & Architecture Design** - Use cases, network inventory, rollout phases

### Phase 1: Foundation Setup
2. **Create Cloudflare One Account** - Zero Trust organization setup
3. **Integrate Identity Provider** - IdP connection, SCIM, MFA enforcement
4. **Configure Global Settings** - Block pages, logging, authentication domain

### Phase 2: Network Connectivity
5. **Deploy Cloudflare Tunnel** - Private network connectivity with HA
6. **Deploy WARP Client** - Device enrollment, split tunnel, MDM

### Phase 3: Security Policies (Gateway)
7. **Gateway DNS Policies** - DNS filtering, security categories, blocklists
8. **Gateway Network Policies** - TCP/UDP filtering, implicit deny
9. **Gateway HTTP Policies** - TLS inspection, AV scanning, content filtering
10. **Resolver Policies** - Private DNS, hostname-based routing

### Phase 4: Access Control (ZTNA)
11. **Access Applications** - Self-hosted apps, SSH/RDP browser rendering
12. **Device Posture Checks** - WARP checks, EDR integration
13. **WARP Session Timeout** - Re-authentication configuration

### Phase 5: Advanced Security
14. **Data Loss Prevention** - DLP profiles, sensitive data detection
15. **Browser Isolation** - RBI for risky sites, privileged users
16. **CASB & Shadow IT** - SaaS discovery, API-driven CASB
17. **Egress Policies** - Dedicated IPs, virtual networks

### Phase 6: Rollout & Operations
18. **Testing & Validation** - Pilot testing, policy verification
19. **Production Rollout** - Phased deployment, user communication
20. **Ongoing Operations** - Alerting, SIEM integration, Terraform

## Application Services Guides

### Domain Migration Guide

The zero-downtime domain migration guide covers 15 steps across 4 phases:

1. **Phase 0: Preparation** - Rollback strategy, DNS backup, monitoring, stakeholder communication
2. **Phase 1: Partial Setup** - Add zone, configure SSL/TLS, create DNS records, test with /etc/hosts
3. **Phase 2: Full Setup** - Handle DNSSEC, convert to full setup, update nameservers
4. **Phase 3: Enable Proxy** - Enable orange cloud, route traffic, IaC/CI-CD setup

### Cloudflare for SaaS Guide

The Cloudflare for SaaS & Custom Hostnames guide covers 14 steps across 3 phases:

#### Phase 1: Test with Dashboard UI
1. **Enable Cloudflare for SaaS** - Zone setup, plan features, hostname prioritization
2. **Create Fallback Origin** - Proxied DNS record for default traffic routing
3. **Create CNAME Target** - Friendly DNS target for customer CNAME records (optional but recommended)
4. **Create Test Custom Hostname** - SSL settings, certificate authority, validation method
5. **Complete Domain Validation** - TXT/HTTP validation, Delegated DCV for auto-renewal
6. **Customer DNS Configuration** - CNAME routing, traffic verification

#### Phase 2: Production with API/Terraform
7. **API Authentication** - Token creation, Zone ID, environment setup
8. **Create Fallback Origin via API** - Programmatic fallback origin management
9. **Create Custom Hostnames via API** - CRUD operations, Terraform resources
10. **Retrieve Validation Records** - Automated customer notification
11. **Configure Custom Origins** - Per-hostname origin routing (optional)

#### Phase 3: Verification & Production Readiness
12. **Verify Custom Hostname Status** - Dashboard, API, and traffic verification
13. **Production Automation & Monitoring** - Lifecycle management, analytics, Terraform
14. **Enable Security Features** - WAF for SaaS, rate limiting, custom metadata

## Quick Start

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/DavidJKTofan/cf-zone-domain-onboarding)

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

## Features

- **Interactive Checkpoints** - Track progress with required/optional validation
- **State Persistence** - Auto-save progress in browser localStorage
- **Responsive Design** - Mobile-first CSS with breakpoints for tablet/desktop
- **Official Documentation** - Direct links to Cloudflare docs for each step
- **Dashboard Deep Links** - Quick access to relevant Cloudflare dashboard pages
- **Contextual Warnings** - Step-specific alerts for common pitfalls
- **Command Examples** - Copy-paste commands for CLI operations
- **Modular Architecture** - Easy to extend with new guides and steps

## Adding a New Guide

### 1. Create Steps File
Create a new TypeScript file in `src/guides/<category>/`:

```typescript
// src/guides/cloudflare-one/my-new-guide.ts
import type { MigrationStep } from '../../types';

export const MY_NEW_GUIDE_STEPS: Omit<MigrationStep, 'status'>[] = [
    {
        id: 'step-id',
        title: 'Step Title',
        description: 'Step description with details...',
        estimatedTime: '15 minutes',
        checkpoints: [
            { id: 'task-1', label: 'First task', completed: false, optional: false },
            { id: 'task-2', label: 'Optional task', completed: false, optional: true },
        ],
        documentation: ['https://developers.cloudflare.com/...'],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/...',
        phase: 1,
        phaseTitle: 'Phase Name',
    },
    // ... more steps
];

export const GUIDE_METADATA = {
    id: 'my-new-guide',
    slug: 'my-new-guide',
    title: 'My New Guide',
    // ...
};
```

### 2. Register the Guide
Add to `src/guides/registry.ts`:

```typescript
guides: [
    // existing guides...
    {
        id: 'my-new-guide',
        slug: 'my-new-guide',
        title: 'My New Guide',
        category: 'cloudflare-one',
        status: 'available',
        estimatedDuration: '1-2 hours',
    }
]
```

### 3. Add to GUIDE_STEPS
Update `src/index.ts`:

```typescript
import { MY_NEW_GUIDE_STEPS } from './guides/cloudflare-one/my-new-guide';

const GUIDE_STEPS: Record<string, Omit<MigrationStep, 'status'>[]> = {
    // existing...
    'my-new-guide': MY_NEW_GUIDE_STEPS,
};
```

### 4. Add Guide Header
Update `public/scripts.js` `guideHeaders` object:

```javascript
'my-new-guide': {
    title: 'My New Guide Title',
    subtitle: 'Subtitle here',
    description: 'Description...',
    version: 'v1.0',
    pageTitle: 'Browser tab title'
}
```

### 5. Add Warnings/Commands (Optional)
Update `getSaseWarning()` and `getSaseCommandExample()` methods in `public/scripts.js` for step-specific content.

## Customization

### Dashboard Deep Links
Use Cloudflare's dynamic dashboard URL format:
```typescript
dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/records'
dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/dns'
```

### Step Images
Place images in `public/img/<category>/` and reference in steps:
```typescript
images: ['/img/cloudflare-one/tunnel-setup.png']
```

### Progress Bar
Steps with only optional checkpoints are automatically excluded from progress calculation.

## API Endpoints

- `GET /api/guides` - Returns all guide categories and metadata
- `GET /api/guides/:slug` - Returns specific guide metadata
- `GET /api/steps/:slug` - Returns steps for specific guide
- `GET /api/documentation` - Returns categorized documentation links

## Key Resources

### Cloudflare One (Zero Trust)
- [SASE Reference Architecture](https://developers.cloudflare.com/reference-architecture/architectures/sase/)
- [Replace Your VPN Learning Path](https://developers.cloudflare.com/learning-paths/replace-vpn/)
- [Secure Internet Traffic Learning Path](https://developers.cloudflare.com/learning-paths/secure-internet-traffic/)
- [ZTNA Policy Design Guide](https://developers.cloudflare.com/reference-architecture/design-guides/designing-ztna-access-policies/)

### Application Services
- [Minimize Downtime](https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/)
- [Partial (CNAME) Setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/)
- [Convert Partial to Full Setup](https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/)
- [Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
- [Custom Hostnames Getting Started](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/)
- [Common API Calls](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/common-api-calls/)

## Workers Best Practices

This project follows [Cloudflare Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/):

- **Modular Code Structure** - Guides are organized in separate modules
- **Type Safety** - Full TypeScript with strict type checking
- **Asset Binding** - Static assets served via Workers Assets
- **Minimal Dependencies** - No external runtime dependencies
- **Error Handling** - Proper 404/405 responses for invalid routes

## Disclaimer

**This is an unofficial third-party tool and is NOT associated with or endorsed by Cloudflare.**

This tool is provided for educational and informational purposes only. It is the user's responsibility to thoroughly review all configurations, verify settings, and test in non-production environments first. The authors assume no liability for any issues arising from the use of this guide.
