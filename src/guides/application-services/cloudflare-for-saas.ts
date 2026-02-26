// src/guides/application-services/cloudflare-for-saas.ts

import type { MigrationStep } from '../../types';

/**
 * Onboarding steps for Cloudflare for SaaS and Custom Hostnames
 * Extend security and performance benefits to customers via their own custom or vanity domains
 */
export const CLOUDFLARE_FOR_SAAS_STEPS: Omit<MigrationStep, 'status'>[] = [
    // Phase 1: Test with Dashboard UI
    {
        id: 'enable-saas',
        title: 'Enable Cloudflare for SaaS',
        description:
            'Enable Cloudflare for SaaS on your zone to unlock custom hostname functionality. This guide uses example hostnames: saas.customer.com (Custom Hostname), *.customers.example.com (CNAME Target wildcard), and fallback.example.com (Fallback Origin).',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'zone-exists', label: 'Active Cloudflare zone exists for your SaaS domain (e.g., example.com)', completed: false, optional: false },
            { id: 'saas-enabled', label: 'Cloudflare for SaaS available (SSL/TLS > Custom Hostnames)', completed: false, optional: false },
            { id: 'hostname-priority-reviewed', label: 'Hostname prioritization guidelines reviewed (wildcard vs exact match)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/',
            'https://developers.cloudflare.com/ssl/reference/certificate-and-hostname-priority/#hostname-priority',
        ],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/custom-hostnames',
        phase: 1,
        phaseTitle: 'Test with Dashboard UI',
    },
    {
        id: 'create-fallback-origin',
        title: 'Create Fallback Origin',
        description:
            'The fallback origin is where Cloudflare routes traffic sent to your custom hostnames by default. Create a proxied DNS record (A, AAAA, or CNAME) pointing to the IP address or hostname of your origin server. Alternatively, use a Cloudflare Worker as your fallback origin with an originless DNS record. The fallback origin cannot be the zone apex (root domain).',
        estimatedTime: '10 minutes',
        checkpoints: [
            { id: 'dns-record-created', label: 'Proxied DNS record created for fallback origin (e.g., fallback.example.com)', completed: false, optional: false },
            { id: 'record-proxied', label: 'DNS record is proxied (orange cloud enabled)', completed: false, optional: false },
            { id: 'fallback-configured', label: 'Fallback origin designated in Custom Hostnames settings', completed: false, optional: false },
            { id: 'fallback-active', label: 'Fallback origin status shows Active', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/#1-create-fallback-origin',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/',
            'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/',
            'https://developers.cloudflare.com/dns/proxy-status/',
        ],
        images: ['/img/application-services/cloudflare-for-saas/step-2-fallback-origin.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/custom-hostnames',
        phase: 1,
        phaseTitle: 'Test with Dashboard UI',
    },
    {
        id: 'create-cname-target',
        title: 'Create CNAME Target (Optional)',
        description:
            'The CNAME target provides a friendly and flexible DNS target for your customers to point their CNAME records to (e.g., customers.example.com). This is optional but highly encouraged as it simplifies customer onboarding and allows for easier traffic management. Create a proxied CNAME record pointing to your fallback origin. You can use a wildcard (*.customers.example.com) for flexibility.',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'cname-target-created', label: 'Proxied CNAME record created pointing to fallback origin (e.g., customers.example.com → fallback.example.com)', completed: false, optional: false },
            { id: 'cname-target-documented', label: 'CNAME target hostname documented for customer communications', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/#2-optional-create-cname-target',
            'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/',
            'https://developers.cloudflare.com/dns/manage-dns-records/reference/wildcard-dns-records/',
        ],
        images: ['/img/application-services/cloudflare-for-saas/step-3-fallback-cname-target.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/dns/records',
        phase: 1,
        phaseTitle: 'Test with Dashboard UI',
    },
    {
        id: 'create-test-hostname',
        title: 'Create a Test Custom Hostname',
        description:
            'Create your first custom hostname (vanity domain) to test the setup. Configure SSL settings including certificate type, certificate authority, validation method, and minimum TLS version.',
        estimatedTime: '10 minutes',
        checkpoints: [
            { id: 'hostname-created', label: 'Custom hostname created (e.g., saas.customer.com)', completed: false, optional: false },
            { id: 'cert-type-selected', label: 'Certificate type selected (Cloudflare-managed recommended)', completed: false, optional: false },
            { id: 'ca-selected', label: 'Certificate Authority selected (Google Trust Services or Let\'s Encrypt)', completed: false, optional: false },
            { id: 'validation-method-selected', label: 'Validation method selected (TXT recommended for pre-validation)', completed: false, optional: false },
            { id: 'min-tls-configured', label: 'Minimum TLS version configured (1.2 recommended)', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/create-custom-hostnames/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/',
            'https://developers.cloudflare.com/ssl/reference/certificate-authorities/',
        ],
        images: ['/img/application-services/cloudflare-for-saas/step-4-create-custom-hostname.png'],
        dashboardLink: 'https://dash.cloudflare.com/?to=/:account/:zone/ssl-tls/custom-hostnames',
        phase: 1,
        phaseTitle: 'Test with Dashboard UI',
    },
    {
        id: 'complete-validation',
        title: 'Complete Domain Validation',
        description:
            'Your customer must validate ownership of their domain before the certificate is issued. Validation methods include TXT (recommended for pre-validation), and HTTP (when CNAME already points to fallback). For automated certificate renewals, consider setting up Delegated DCV.',
        estimatedTime: '15-30 minutes',
        checkpoints: [
            { id: 'validation-records-shared', label: 'Validation records shared with customer', completed: false, optional: false },
            { id: 'txt-record-added', label: 'Customer added TXT record at _cf-custom-hostname.<hostname> (if using TXT)', completed: false, optional: true },
            { id: 'cname-pointed', label: 'Customer CNAME points to fallback origin (if using HTTP)', completed: false, optional: true },
            { id: 'validation-complete', label: 'Validation completed (hostname status is Active)', completed: false, optional: false },
            { id: 'delegated-dcv-setup', label: 'Delegated DCV configured for automated renewals (CNAME _acme-challenge.<hostname> to <hostname>.dcv.cloudflare.com)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/issue-and-validate/validate-certificates/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/hostname-validation/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/issue-and-validate/validate-certificates/delegated-dcv/',
        ],
        images: ['/img/application-services/cloudflare-for-saas/step-5-custom-hostname-validation-records.png'],
        phase: 1,
        phaseTitle: 'Test with Dashboard UI',
    },
    {
        id: 'customer-dns-config',
        title: 'Customer DNS Configuration',
        description:
            'After both Certificate status and Hostname status are Active, instruct your customer to create a CNAME record pointing to your CNAME target (e.g., saas.customer.com → customer1.customers.example.com). Traffic flows: saas.customer.com → customer1.customers.example.com (matches *.customers.example.com) → fallback.example.com → Origin Server.',
        estimatedTime: '10-15 minutes',
        checkpoints: [
            { id: 'statuses-verified', label: 'Both Certificate status and Hostname status are Active before customer DNS change', completed: false, optional: false },
            { id: 'customer-cname-created', label: 'Customer created CNAME record pointing to your CNAME target (saas.customer.com → customer1.customers.example.com)', completed: false, optional: false },
            { id: 'traffic-verified', label: 'Traffic verified (HTTPS request to custom hostname succeeds)', completed: false, optional: false },
            { id: 'cf-ray-header', label: 'Cloudflare cf-ray header present in response', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/#3-have-customer-create-cname-record',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/reference/status-codes/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/apex-proxying/',
            'https://developers.cloudflare.com/fundamentals/reference/http-headers/',
        ],
        phase: 1,
        phaseTitle: 'Test with Dashboard UI',
    },

    // Phase 2: Production with API/Terraform
    {
        id: 'api-authentication',
        title: 'Set Up API Authentication',
        description:
            'Configure API access for programmatic management of custom hostnames. Create an API token with appropriate permissions and note your Zone ID.',
        estimatedTime: '10 minutes',
        checkpoints: [
            { id: 'api-token-created', label: 'API token created with SSL and Certificates Edit permission', completed: false, optional: false },
            { id: 'zone-id-noted', label: 'Zone ID retrieved from dashboard overview', completed: false, optional: false },
            { id: 'env-vars-set', label: 'Environment variables configured (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID)', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/fundamentals/api/get-started/create-token/',
            'https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/common-api-calls/',
            'https://developers.cloudflare.com/api/',
        ],
        dashboardLink: 'https://dash.cloudflare.com/profile/api-tokens',
        phase: 2,
        phaseTitle: 'Production with API/Terraform',
    },
    {
        id: 'api-fallback-origin',
        title: 'Create Fallback Origin via API',
        description:
            'Set up the fallback origin programmatically using the Cloudflare API or Terraform. This is the foundation for all custom hostname traffic routing.',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'fallback-api-created', label: 'Fallback origin created via API (PUT /zones/{zone_id}/custom_hostnames/fallback_origin)', completed: false, optional: false },
            { id: 'fallback-terraform-created', label: 'Fallback origin managed with Terraform (cloudflare_custom_hostname_fallback_origin)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/api/resources/custom_hostnames/subresources/fallback_origin/methods/update/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/common-api-calls/',
            'https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/custom_hostname_fallback_origin',
        ],
        phase: 2,
        phaseTitle: 'Production with API/Terraform',
    },
    {
        id: 'api-custom-hostnames',
        title: 'Create Custom Hostnames via API',
        description:
            'Create custom hostnames programmatically when customers onboard. The API allows you to specify hostname, SSL settings (including cipher suites), validation method, and custom origin.',
        estimatedTime: '10-15 minutes',
        checkpoints: [
            { id: 'create-endpoint-tested', label: 'Create custom hostname endpoint tested (POST /zones/{zone_id}/custom_hostnames)', completed: false, optional: false },
            { id: 'list-endpoint-tested', label: 'List custom hostnames endpoint tested (GET /zones/{zone_id}/custom_hostnames)', completed: false, optional: false },
            { id: 'get-endpoint-tested', label: 'Get custom hostname details endpoint tested (GET /zones/{zone_id}/custom_hostnames/{id})', completed: false, optional: false },
            { id: 'delete-endpoint-tested', label: 'Delete custom hostname endpoint tested (DELETE /zones/{zone_id}/custom_hostnames/{id})', completed: false, optional: false },
            { id: 'terraform-resource-tested', label: 'Terraform cloudflare_custom_hostname resource tested', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/api/resources/custom_hostnames/methods/create/',
            'https://developers.cloudflare.com/api/resources/custom_hostnames/methods/list/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/common-api-calls/',
            'https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/custom_hostname',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/enforce-mtls/#cipher-suites',
        ],
        phase: 2,
        phaseTitle: 'Production with API/Terraform',
    },
    {
        id: 'retrieve-validation',
        title: 'Retrieve Validation Records',
        description:
            'After creating a custom hostname, retrieve the validation records from the API response to send to your customer. The validation_records field contains the TXT record name and value.',
        estimatedTime: '5 minutes',
        checkpoints: [
            { id: 'validation-records-retrieved', label: 'Validation records retrieved from API response (ssl.validation_records)', completed: false, optional: false },
            { id: 'customer-notification-automated', label: 'Customer notification process automated with validation details', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/hostname-validation/',
            'https://developers.cloudflare.com/api/resources/custom_hostnames/methods/get/',
        ],
        phase: 2,
        phaseTitle: 'Production with API/Terraform',
    },
    {
        id: 'custom-origins',
        title: 'Configure Custom Origins (Optional)',
        description:
            'Route specific custom hostnames to different origin servers using custom origins. This allows you to direct premium customers to dedicated infrastructure or route by geography.',
        estimatedTime: '10 minutes',
        checkpoints: [
            { id: 'custom-origin-dns-created', label: 'DNS record created for custom origin (e.g., premium-origin.example.com)', completed: false, optional: false },
            { id: 'custom-origin-assigned', label: 'Custom origin assigned to hostname via API (custom_origin_server field)', completed: false, optional: false },
            { id: 'traffic-routing-verified', label: 'Traffic routing to custom origin verified', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/custom-origin/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/reference/connection-details/',
        ],
        phase: 2,
        phaseTitle: 'Production with API/Terraform',
    },
    {
        id: 'custom-metadata',
        title: 'Configure Custom Metadata',
        description:
            'Custom metadata allows you to store per-hostname JSON data that can be accessed in Cloudflare Workers (via request.cf.hostMetadata) or WAF rule expressions (via cf.hostname.metadata). Use it for per-customer URL rewriting, custom headers, security tagging, or any hostname-specific configuration.',
        estimatedTime: '15-30 minutes',
        checkpoints: [
            { id: 'metadata-schema-designed', label: 'Custom metadata JSON schema designed (use flat structure, snake_case keys)', completed: false, optional: false },
            { id: 'metadata-added-via-api', label: 'Custom metadata added to hostname via PATCH API (custom_metadata field)', completed: false, optional: false },
            { id: 'worker-or-rules-configured', label: 'Cloudflare Worker or WAF rules configured to use metadata', completed: false, optional: true },
            { id: 'security-tags-implemented', label: 'Security tagging system implemented (e.g., low/medium/high for WAF rules)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/custom-metadata/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/waf-for-saas/',
            'https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.hostname.metadata/',
            'https://developers.cloudflare.com/api/resources/custom_hostnames/methods/edit/',
        ],
        phase: 2,
        phaseTitle: 'Production with API/Terraform',
    },

    // Phase 3: Verification & Production Readiness
    {
        id: 'verify-hostnames',
        title: 'Verify Custom Hostname Status',
        description:
            'Confirm your custom hostnames are active and serving traffic correctly. Verify via dashboard, API, and actual traffic tests.',
        estimatedTime: '15 minutes',
        checkpoints: [
            { id: 'dashboard-status-active', label: 'Hostname status shows Active in dashboard', completed: false, optional: false },
            { id: 'ssl-status-active', label: 'SSL certificate status shows Active', completed: false, optional: false },
            { id: 'api-status-verified', label: 'Status verified via API (GET /zones/{zone_id}/custom_hostnames?hostname=...)', completed: false, optional: false },
            { id: 'https-test-passed', label: 'HTTPS connectivity test passed (curl -I https://saas.customer.com)', completed: false, optional: false },
            { id: 'cf-ray-present', label: 'Cloudflare headers present (cf-ray header in response)', completed: false, optional: false },
            { id: 'ssl-cert-verified', label: 'SSL certificate chain verified (openssl s_client test)', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/reference/status-codes/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/reference/troubleshooting/',
        ],
        phase: 3,
        phaseTitle: 'Verification & Production Readiness',
    },
    {
        id: 'production-automation',
        title: 'Production Automation & Monitoring',
        description:
            'Set up production automation for custom hostname lifecycle management. Implement monitoring for hostname status, certificate expiration, and traffic patterns.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'onboarding-automated', label: 'Customer onboarding workflow automated (create hostname, send validation)', completed: false, optional: false },
            { id: 'offboarding-automated', label: 'Customer offboarding workflow automated (delete hostname)', completed: false, optional: false },
            { id: 'status-monitoring', label: 'Hostname status monitoring implemented', completed: false, optional: true },
            { id: 'cert-expiry-alerts', label: 'Certificate expiration alerts configured', completed: false, optional: true },
            { id: 'analytics-integrated', label: 'Per-hostname analytics integrated (GraphQL API clientRequestHTTPHost)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/hostname-analytics/',
            'https://developers.cloudflare.com/analytics/graphql-api/tutorials/end-customer-analytics/',
            'https://developers.cloudflare.com/terraform/',
            'https://developers.cloudflare.com/logs/logpush/',
        ],
        terraformFiles: [
            { name: 'main.tf', description: 'Provider config and zone data source', path: '/terraform/cloudflare-for-saas/main.tf' },
            { name: 'variables.tf', description: 'Input variables for zone, fallback origin, hostnames', path: '/terraform/cloudflare-for-saas/variables.tf' },
            { name: 'outputs.tf', description: 'Output values for hostname IDs and validation records', path: '/terraform/cloudflare-for-saas/outputs.tf' },
            { name: 'fallback-origin.tf', description: 'Fallback origin configuration', path: '/terraform/cloudflare-for-saas/fallback-origin.tf' },
            { name: 'custom-hostnames.tf', description: 'Custom hostname resources with SSL settings', path: '/terraform/cloudflare-for-saas/custom-hostnames.tf' },
            { name: 'terraform.tfvars.example', description: 'Example variables file', path: '/terraform/cloudflare-for-saas/terraform.tfvars.example' },
        ],
        phase: 3,
        phaseTitle: 'Verification & Production Readiness',
    },
    {
        id: 'security-features',
        title: 'Enable Additional Features',
        description:
            'Apply additional security features to your custom hostnames including WAF for SaaS, rate limiting, and custom metadata for per-hostname configuration.',
        estimatedTime: '30 minutes - 1 hour',
        checkpoints: [
            { id: 'waf-configured', label: 'WAF for SaaS rules configured', completed: false, optional: true },
            { id: 'rate-limiting-configured', label: 'Rate limiting rules applied', completed: false, optional: true },
            { id: 'custom-metadata-configured', label: 'Custom metadata configured for per-hostname settings', completed: false, optional: true },
            { id: 'access-policies-configured', label: 'Cloudflare Access policies configured (if applicable)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/waf-for-saas/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/custom-metadata/',
            'https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/secure-with-access/',
        ],
        phase: 3,
        phaseTitle: 'Verification & Production Readiness',
    },
];

export const GUIDE_METADATA = {
    id: 'cloudflare-for-saas',
    slug: 'cloudflare-for-saas',
    title: 'Cloudflare for SaaS & Custom Hostnames',
    shortTitle: 'Custom Hostnames',
    description: 'Extend security and performance benefits to your customers via their own custom or vanity domains.',
    category: 'application-services' as const,
    status: 'available' as const,
    estimatedDuration: '2-4 hours',
    version: '1.0.0',
};
