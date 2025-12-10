# Cloudflare Zero-Downtime Migration Guide

Complete TypeScript Cloudflare Worker with Static Assets frontend for guiding users through domain migration to Cloudflare with minimal or zero downtime using Partial (CNAME) Setup.

## Architecture

- **Worker Backend**: TypeScript worker serving API endpoints and static assets
- **Frontend**: Single-page HTML application with step-sequenced onboarding
- **State Management**: LocalStorage-based checkpoint persistence
- **Static Assets**: Served via Workers Static Assets binding

## Project Structure

```
.
├── src/
│   └── index.ts              # Worker TypeScript entry point
├── public/
│   └── index.html            # Interactive migration guide frontend
├── wrangler.toml             # Worker configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Migration Flow Coverage

### Phase 1: Partial Setup (Testing Phase)

1. **Add Zone and Select Enterprise Plan**

   - Add domain to Cloudflare
   - Select Business/Enterprise plan for Partial Setup capability

2. **Convert to Partial (CNAME) Setup**

   - Convert zone to Partial Setup mode
   - Save verification TXT record details

3. **Verify Domain Ownership**

   - Add verification TXT record at authoritative DNS
   - Wait for Cloudflare confirmation email

4. **Order Advanced Certificate (TXT Validation)**

   - Order Advanced Certificate with TXT validation method
   - Add TXT validation record to authoritative DNS
   - Confirm certificate status is Active

5. **Create DNS Records and Configuration**

   - Import all DNS records (A, AAAA, CNAME)
   - Set all records to DNS-only (unproxied) mode
   - Configure WAF, Rules, caching, Logpush (optional)

6. **Test via /etc/hosts Override**

   - Retrieve Cloudflare Anycast IPs via `dig +short yourdomain.com.cdn.cloudflare.net`
   - Add IPs to `/etc/hosts` file
   - Test SSL/TLS, caching (cf-cache-status), Rules, WAF locally

7. **Iterate Configuration Until Satisfied**
   - Refine DNS, SSL, WAF, caching based on test results
   - Repeat testing until production-ready

### Phase 2: Migration to Full Setup

8. **Handle DNSSEC Migration**

   - Check DNSSEC status at authoritative DNS
   - Either disable DNSSEC 24h before migration, or setup multi-signer DNSSEC
   - Follow advanced guide for active DNSSEC migration if needed

9. **Convert to Full Setup**

   - Ensure all records remain DNS-only (unproxied)
   - Convert zone from Partial to Full Setup
   - Save assigned Cloudflare nameservers

10. **Lower TTL at Authoritative DNS**

    - Reduce TTL values to 300-600 seconds
    - Wait for old TTL period to expire

11. **Update Nameservers at Registrar**
    - Add Cloudflare nameservers at domain registrar
    - Monitor DNS propagation using `dig` checks
    - Confirm zone status changes to Active in Cloudflare

### Phase 3: Enable Cloudflare Proxy

12. **Enable Proxied (Orange Cloud) Status**
    - Confirm SSL/TLS certificate is Active for all hostnames
    - Whitelist Cloudflare IPs at origin server
    - Enable proxied status on target DNS records
    - Verify traffic flows through Cloudflare (check cf-ray headers)

## Installation

```bash
npm install
```

## Development

```bash
# Start local development server
npm run dev

# Generate TypeScript types
npm run types
```

Access the guide at `http://localhost:8787`

## Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

After deployment, the guide will be accessible at:

- `https://cloudflare-migration-guide.<your-subdomain>.workers.dev`
- Or your custom domain if configured

## API Endpoints

### GET /api/steps

Returns all migration steps with checkpoints and documentation links.

**Response:**

```json
{
  "steps": [
    {
      "id": "add-zone",
      "title": "Add Zone and Select Enterprise Plan",
      "description": "...",
      "status": "pending",
      "checkpoints": [...],
      "documentation": [...]
    }
  ]
}
```

### GET /api/documentation

Returns categorized documentation links.

**Response:**

```json
{
  "general": [...],
  "partial_setup": [...],
  "full_setup": [...],
  "conversion": [...],
  "ssl": [...],
  "dnssec": [...],
  "proxy": [...]
}
```

## Frontend Features

- **Step Navigation**: Sidebar navigation with progress indicators
- **Checkpoint Tracking**: Interactive checkboxes with completion validation
- **Progress Bar**: Visual progress tracking across all steps
- **State Persistence**: LocalStorage-based state saving across sessions
- **Documentation Links**: Direct links to official Cloudflare documentation
- **Responsive Design**: Mobile-friendly layout
- **Command Examples**: Pre-formatted terminal commands for key operations

## Configuration Options

### wrangler.toml

```toml
[assets]
directory = "./public/"
binding = "ASSETS"
not_found_handling = "single-page-application"
```

- **directory**: Static assets location (HTML, CSS, JS)
- **binding**: Environment binding name for asset fetcher
- **not_found_handling**: SPA mode for client-side routing

## Technical Requirements

- Node.js 16.17.0 or later
- Wrangler CLI 3.66.0 or later
- Cloudflare account with Workers enabled

## Key Documentation References

- [Partial (CNAME) Setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/)
- [Convert Partial to Full Setup](https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/)
- [Minimize Downtime](https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/)
- [Advanced Certificate Manager](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/manage-certificates/)
- [DNSSEC Active Migration](https://developers.cloudflare.com/dns/dnssec/dnssec-active-migration/)
- [Proxy Status](https://developers.cloudflare.com/dns/proxy-status/)

## State Management

User progress is persisted in browser LocalStorage with the following structure:

```json
{
	"currentStep": 0,
	"checkpoints": {
		"0-0": true,
		"0-1": true
	}
}
```

Reset state by clearing browser storage or refreshing after completion.

## Advanced Use Cases

### DNSSEC Active Migration

For domains with active DNSSEC, follow the multi-signer DNSSEC migration process detailed in Step 8. This involves cross-importing Zone Signing Keys (ZSKs) between providers.

### Custom Domain Deployment

To deploy on a custom domain:

```toml
# Add to wrangler.toml
routes = [
  { pattern = "migration.yourdomain.com", custom_domain = true }
]
```

### Extended Configuration Testing

The `/etc/hosts` testing phase (Step 6) allows validation of:

- SSL/TLS certificate issuance and validation
- Cache behavior (cf-cache-status headers)
- WAF rule effectiveness
- Page Rules / Transform Rules execution
- Origin connection and response codes

## Troubleshooting

### Certificate Not Issuing

- Ensure TXT validation record is correctly added at authoritative DNS
- Verify DNS propagation using `dig` or online tools
- Check certificate status in Cloudflare dashboard

### DNS Not Resolving After Nameserver Change

- Confirm nameservers are correctly updated at registrar
- Check DNS propagation using `dig @8.8.8.8 yourdomain.com`
- Wait for TTL expiration from previous authoritative DNS

### Origin Connection Errors After Proxying

- Verify Cloudflare IPs are whitelisted at origin
- Check SSL/TLS encryption mode matches origin certificate
- Ensure origin is responding correctly to Cloudflare requests

## License

MIT
