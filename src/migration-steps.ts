// src/migration-steps.ts
import type { MigrationStep } from './types';

/**
 * Migration steps for zero-downtime Cloudflare domain migration
 * using Partial (CNAME) Setup transitioning to Full Setup
 */
export const MIGRATION_STEPS: Omit<MigrationStep, 'status'>[] = [
    {
        id: 'preparation',
        title: 'Migration Preparation & Rollback Strategy',
        description:
            'Before starting the migration, prepare your rollback strategy, backup DNS records, plan monitoring, and communicate with stakeholders. Keep legacy DNS active for 7-14 days post-cutover to facilitate potential rollback.',
        estimatedTime: '30-60 minutes',
        checkpoints: [
            { id: 'dns-backup-created', label: 'All DNS records exported and backed up from current provider', completed: false, optional: false },
            { id: 'rollback-plan', label: 'Rollback procedure documented (revert nameservers to original)', completed: false, optional: false },
            { id: 'grace-period-planned', label: 'Grace period scheduled (keep legacy DNS active 7-14 days post-migration)', completed: false, optional: false },
            { id: 'monitoring-strategy', label: 'Monitoring strategy defined (uptime, DNS, SSL, application health)', completed: false, optional: false },
            { id: 'stakeholders-notified', label: 'Stakeholders notified of migration timeline and maintenance window', completed: false, optional: false },
            { id: 'decommission-plan', label: 'Legacy DNS decommission plan created (timeline, backup retention)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/',
            'https://developers.cloudflare.com/terraform/tutorial/revert-configuration/',
        ],
    },
    {
        id: 'add-zone',
        title: 'Add Zone to Cloudflare',
        description:
            'Add your domain to Cloudflare. Partial (CNAME) Setup requires a Business or Enterprise plan. This setup allows you to use Cloudflare on specific subdomains while keeping your existing DNS provider.',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'zone-added', label: 'Domain added to Cloudflare account', completed: false, optional: false },
            { id: 'plan-selected', label: 'Business or Enterprise plan selected (required for Partial Setup)', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/fundamentals/account/create-account/',
            'https://developers.cloudflare.com/fundamentals/manage-domains/add-site/',
            'https://developers.cloudflare.com/dns/zone-setups/partial-setup/',
        ],
        images: ['img/step-1-add-zone.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/add-site',
    },
    {
        id: 'convert-partial',
        title: 'Convert to Partial (CNAME) Setup',
        description:
            'Convert your zone to Partial Setup to enable testing before changing nameservers. This allows your live traffic to continue through your existing provider.',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'zone-converted', label: 'Zone converted to Partial Setup', completed: false, optional: false },
            { id: 'txt-record-noted', label: 'Verification TXT record details saved', completed: false, optional: false },
        ],
        documentation: ['https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/#1-convert-your-zone-and-review-dns-records'],
        images: ['img/step-2-convert-partial.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/settings/convert-zone',
    },
    {
        id: 'verify-ownership',
        title: 'Verify Domain Ownership',
        description:
            'Add the verification TXT record to your authoritative DNS provider to prove domain ownership. This record must remain in place during Partial Setup.',
        estimatedTime: '5-10 minutes',
        checkpoints: [
            { id: 'txt-added', label: 'Verification TXT record added at authoritative DNS', completed: false, optional: false },
            { id: 'verification-confirmed', label: 'Cloudflare confirmed domain ownership via email', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/#2-verify-ownership-for-your-domain',
            'https://developers.cloudflare.com/fundamentals/user-profiles/verify-email-address/',
            'https://developers.cloudflare.com/dns/zone-setups/reference/domain-status/'
        ],
        images: ['img/step-3-verify-ownership.png'],
    },
    {
        id: 'configure-ssl',
        title: 'Prepare SSL/TLS Certificates',
        description:
            'Order Advanced Certificates with TXT validation method, or upload a custom certificate. This ensures SSL/TLS is ready before DNS migration.',
        estimatedTime: '10-15 minutes',
        checkpoints: [
            { id: 'ssl-mode-selected', label: 'SSL/TLS encryption mode configured (Full or Full Strict recommended)', completed: false, optional: false },
            { id: 'cert-ordered', label: 'Advanced Certificate ordered (or custom certificate uploaded)', completed: false, optional: false },
            { id: 'txt-validation-added', label: 'DCV TXT validation record added to authoritative DNS', completed: false, optional: false },
            { id: 'cert-active', label: 'Certificate status is Active', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/manage-certificates/',
            'https://developers.cloudflare.com/ssl/edge-certificates/changing-dcv-method/methods/txt/',
            'https://developers.cloudflare.com/ssl/edge-certificates/custom-certificates/uploading/',
            'https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/',
        ],
        images: ['img/step-4-configure-ssl.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/edge-certificates',
    },
    {
        id: 'configure-dns',
        title: 'Create DNS Records and Configuration',
        description:
            'Add DNS records for testing during Partial Setup. Only A, AAAA, and CNAME records can be added at this stage. MX records (email), TXT records (SPF, DKIM, DMARC), SRV records (services), and other record types will be added later after converting to Full Setup in Step 11. Apply configurations (WAF, Rules, caching) for the records you create now.',
        estimatedTime: '20-60 minutes',
        checkpoints: [
            { id: 'dns-imported', label: 'DNS records created in Cloudflare', completed: false, optional: false },
            { id: 'waf-configured', label: 'WAF rules configured', completed: false, optional: true },
            { id: 'rules-configured', label: 'Rules configured', completed: false, optional: true },
            { id: 'cache-configured', label: 'Cache configuration reviewed', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/',
            'https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/',
            'https://developers.cloudflare.com/dns/proxy-status/',
            'https://developers.cloudflare.com/waf/',
            'https://developers.cloudflare.com/cache/',
            'https://developers.cloudflare.com/rules/',
        ],
        images: ['img/step-5-configure-dns.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/records',
    },
    {
        id: 'protect-origin',
        title: 'Protect Your Origin Server',
        description:
            'Configure your origin server to accept traffic from Cloudflare.',
        estimatedTime: '10-15 minutes',
        checkpoints: [
            { id: 'cf-ips-allowlisted', label: 'Cloudflare IP addresses are not blocked, or optimally allowlisted at origin firewall', completed: false, optional: false },
            { id: 'authenticated-origin-pulls', label: 'Authenticated Origin Pulls (mTLS) reviewed', completed: false, optional: true },
            { id: 'cloudflare-tunnel', label: 'Cloudflare Tunnel reviewed', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/',
            'https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/',
            'https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/',
            'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/',
            'https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/'
        ],
    },
    {
        id: 'local-testing',
        title: 'Test via /etc/hosts Override',
        description:
            'Test your Cloudflare configuration locally by overriding DNS with /etc/hosts entries pointing to Cloudflare Anycast IPs. Note: Your CNAME Setup zone must be in Active status (TXT verification completed) before you can retrieve the assigned Cloudflare IPs via dig.',
        estimatedTime: '15-30 minutes',
        checkpoints: [
            { id: 'zone-active-verified', label: 'Zone status is Active (TXT verification completed)', completed: false, optional: false },
            { id: 'cf-ips-retrieved', label: 'Cloudflare Anycast IPs retrieved (dig yourdomain.com.cdn.cloudflare.net)', completed: false, optional: false },
            { id: 'hosts-updated', label: '/etc/hosts file updated with Cloudflare IPs', completed: false, optional: false },
            { id: 'ssl-validated', label: 'SSL/TLS certificate validated locally (check certificate chain)', completed: false, optional: false },
            { id: 'cache-tested', label: 'Cache behavior tested (cf-cache-status header)', completed: false, optional: true },
            { id: 'rules-tested', label: 'WAF, Rules, and redirects validated', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/',
            'https://developers.cloudflare.com/cache/concepts/cache-responses/',
            'https://developers.cloudflare.com/ssl/reference/certificate-statuses/',
            'https://developers.cloudflare.com/dns/zone-setups/reference/domain-status/'
        ],
    },
    {
        id: 'iterate-config',
        title: 'Iterate Configuration Until Satisfied',
        description:
            'Refine DNS records, SSL settings, WAF rules, caching policies, and other configurations based on local testing results. Repeat testing until ready.',
        estimatedTime: '30 minutes - 2 hours',
        checkpoints: [
            { id: 'config-refined', label: 'Configuration adjusted based on test results', completed: false, optional: false },
            { id: 'all-tests-passed', label: 'All functionality validated in test environment', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/',
            'https://developers.cloudflare.com/resources/?filter-pcx_content_type=learning-path&filter-pcx_content_type=tutorial&filter-pcx_content_type=video'
        ],
        images: ['img/step-8-iterate-config.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/security/settings',
    },
    {
        id: 'handle-dnssec',
        title: 'Handle DNSSEC Migration',
        description:
            'If DNSSEC is active at your current DNS provider, you must either disable it before migration (wait for DS record TTL to expire), or use multi-signer DNSSEC to avoid validation failures during the transition.',
        estimatedTime: '5 minutes (or 24-48 hours if waiting for DS TTL)',
        checkpoints: [
            { id: 'dnssec-status-checked', label: 'DNSSEC status verified at current DNS provider and registrar', completed: false, optional: false },
            { id: 'dnssec-disabled', label: 'DNSSEC disabled and DS record removed at registrar (if not using multi-signer)', completed: false, optional: true },
            { id: 'ds-ttl-expired', label: 'Waited for DS record TTL to expire (typically 24-48h)', completed: false, optional: true },
            { id: 'multisigner-setup', label: 'Multi-signer DNSSEC configured (alternative to disabling)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/dnssec/dnssec-active-migration/',
            'https://developers.cloudflare.com/dns/dnssec/multi-signer-dnssec/',
        ],
    },
    {
        id: 'convert-full',
        title: 'Convert to Full Setup',
        description:
            'Convert your zone from Partial to Full Setup. Cloudflare will become your authoritative DNS provider. After conversion, add remaining DNS record types that were not available during Partial Setup: MX records (email), TXT records (SPF, DKIM, DMARC, domain verification), SRV records (services), and any other required records. Optionally keep all DNS records as DNS-only (gray cloud) initially to ensure a smooth transition.',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'zone-converted-full', label: 'Zone converted to Full Setup in dashboard', completed: false, optional: false },
            { id: 'nameservers-noted', label: 'Assigned Cloudflare nameservers noted (two NS records)', completed: false, optional: false },
            { id: 'remaining-records-added', label: 'MX, TXT, SRV, and other record types added to Cloudflare', completed: false, optional: false },
            { id: 'records-unproxied', label: 'All DNS records set to DNS-only (gray cloud)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/',
            'https://developers.cloudflare.com/dns/zone-setups/full-setup/',
            'https://developers.cloudflare.com/dns/proxy-status/'
        ],
        images: ['img/step-10-convert-full.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/settings',
    },
    {
        id: 'lower-ttl',
        title: 'Lower TTL at Current DNS Provider',
        description:
            'Reduce TTL values for NS records and critical DNS records at your current DNS provider. This minimizes caching duration and speeds up propagation when you change nameservers.',
        estimatedTime: '5-10 minutes + wait time for TTL to expire',
        checkpoints: [
            { id: 'ttl-lowered', label: 'TTL values reduced (150-300 seconds recommended)', completed: false, optional: false },
            { id: 'ttl-propagated', label: 'Waited for previous TTL period to expire', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/',
            'https://www.cloudflare.com/learning/cdn/glossary/time-to-live-ttl/',
        ],
    },
    {
        id: 'change-nameservers',
        title: 'Update Nameservers at Registrar',
        description:
            'Change nameservers at your domain registrar to the assigned Cloudflare nameservers. Ensure all DNS records are in place. Note: If you optionally kept records as DNS-only (gray cloud), TLS certificates from Cloudflare will not apply to traffic until proxy is enabled.',
        estimatedTime: '5-10 minutes + propagation time',
        checkpoints: [
            { id: 'dns-records-verified', label: 'All DNS records verified and in place', completed: false, optional: false },
            { id: 'nameservers-updated', label: 'Cloudflare nameservers added at registrar', completed: false, optional: false },
            { id: 'dns-propagated', label: 'DNS propagation confirmed (dig checks)', completed: false, optional: false },
            { id: 'zone-active', label: 'Zone status changed to Active in Cloudflare', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/nameservers/update-nameservers/',
            'https://developers.cloudflare.com/dns/zone-setups/reference/domain-status/',
        ],
    },
    {
        id: 'enable-proxy',
        title: 'Enable Proxied (Orange Cloud) Status',
        description:
            'After DNS propagation is complete and the zone is Active, enable proxied status on DNS records to route traffic through Cloudflare. This activates CDN, WAF, DDoS protection, and other security features.',
        estimatedTime: '10-20 minutes',
        checkpoints: [
            { id: 'hosts-cleanup', label: '/etc/hosts test entries removed', completed: false, optional: false },
            { id: 'cert-revalidated', label: 'SSL/TLS certificate is Active for all hostnames', completed: false, optional: false },
            { id: 'origin-ips-allowed', label: 'Cloudflare IPs are not blocked or optimally allowlisted at origin firewall', completed: false, optional: true },
            { id: 'proxy-enabled', label: 'Proxy status enabled (orange cloud) on DNS records', completed: false, optional: false },
            { id: 'traffic-flowing', label: 'Traffic flowing through Cloudflare (cf-ray header present)', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/dns/proxy-status/',
            'https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/',
            'https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/',
            'https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-ray',
        ],
        images: ['img/step-13-enable-proxy.png'],
    },
    {
        id: 'iac-cicd',
        title: 'Infrastructure as Code & CI/CD Pipelines',
        description:
            'Automate your Cloudflare configuration using Infrastructure as Code (IaC) with Terraform. Use cf-terraforming to export existing configuration and integrate with CI/CD pipelines for version control and automated deployments. After 7-14 days of stable operation, decommission legacy DNS infrastructure.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'terraform-reviewed', label: 'Cloudflare Terraform provider reviewed', completed: false, optional: true },
            { id: 'cf-terraforming-used', label: 'cf-terraforming used to export current configuration', completed: false, optional: true },
            { id: 'terraform-config-created', label: 'Terraform configuration files created', completed: false, optional: true },
            { id: 'cicd-pipeline-setup', label: 'CI/CD pipeline configured for automated deployments', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/terraform/',
            'https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs',
            'https://github.com/cloudflare/cf-terraforming',
            'https://developers.cloudflare.com/workers/ci-cd/',
        ],
    },
];
