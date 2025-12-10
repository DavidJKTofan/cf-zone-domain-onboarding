// src/index.ts
import type { Env, MigrationStep, Checkpoint, StepsResponse, DocumentationResponse } from './types';

const MIGRATION_STEPS: Omit<MigrationStep, 'status'>[] = [
	{
		id: 'add-zone',
		title: 'Add Zone and Select Enterprise Plan',
		description: 'Add your domain to Cloudflare and select the Enterprise or Business plan to enable Partial (CNAME) Setup capability.',
		checkpoints: [
			{ id: 'zone-added', label: 'Domain added to Cloudflare account', completed: false, optional: false },
			{ id: 'plan-selected', label: 'Enterprise or Business plan selected', completed: false, optional: false },
		],
		documentation: [
			'https://developers.cloudflare.com/fundamentals/manage-domains/add-site/',
			'https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/',
		],
	},
	{
		id: 'convert-partial',
		title: 'Convert to Partial (CNAME) Setup',
		description:
			'Convert your zone to Partial Setup to enable testing before changing nameservers. This allows your live traffic to continue through your existing provider.',
		checkpoints: [
			{ id: 'zone-converted', label: 'Zone converted to Partial Setup', completed: false, optional: false },
			{ id: 'txt-record-noted', label: 'Verification TXT record details saved', completed: false, optional: false },
		],
		documentation: ['https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/#1-convert-your-zone-and-review-dns-records'],
	},
	{
		id: 'verify-ownership',
		title: 'Verify Domain Ownership',
		description:
			'Add the verification TXT record to your authoritative DNS provider to prove domain ownership. This record must remain in place during Partial Setup.',
		checkpoints: [
			{ id: 'txt-added', label: 'Verification TXT record added at authoritative DNS', completed: false, optional: false },
			{ id: 'verification-confirmed', label: 'Cloudflare confirmed domain ownership via email', completed: false, optional: false },
		],
		documentation: ['https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/#2-verify-ownership-for-your-domain'],
	},
	{
		id: 'configure-ssl',
		title: 'Order Advanced Certificate (TXT Validation)',
		description:
			'Order an Advanced Certificate with TXT validation to ensure SSL/TLS is ready before DNS migration. Add the validation TXT record at your authoritative DNS.',
		checkpoints: [
			{ id: 'cert-ordered', label: 'Advanced Certificate ordered', completed: false, optional: false },
			{ id: 'txt-validation-added', label: 'TXT validation record added to authoritative DNS', completed: false, optional: false },
			{ id: 'cert-active', label: 'Certificate status is Active', completed: false, optional: false },
		],
		documentation: [
			'https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/manage-certificates/',
			'https://developers.cloudflare.com/ssl/edge-certificates/changing-dcv-method/methods/txt/',
		],
	},
	{
		id: 'configure-dns',
		title: 'Create DNS Records and Configuration',
		description:
			'Add all DNS records (A, AAAA, CNAME) and apply configurations (WAF, Rules, Page Rules, caching, Logpush). Start with DNS-only (unproxied) mode.',
		checkpoints: [
			{ id: 'dns-imported', label: 'DNS records created in Cloudflare', completed: false, optional: false },
			{ id: 'records-unproxied', label: 'All records set to DNS-only (gray cloud)', completed: false, optional: false },
			{ id: 'waf-configured', label: 'WAF rules configured', completed: false, optional: true },
			{ id: 'rules-configured', label: 'Page Rules / Rules configured', completed: false, optional: true },
			{ id: 'cache-configured', label: 'Cache configuration reviewed', completed: false, optional: true },
		],
		documentation: [
			'https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/',
			'https://developers.cloudflare.com/dns/proxy-status/',
			'https://developers.cloudflare.com/waf/',
		],
	},
	{
		id: 'local-testing',
		title: 'Test via /etc/hosts Override',
		description: 'Test your Cloudflare configuration locally by overriding DNS with /etc/hosts entries pointing to Cloudflare Anycast IPs.',
		checkpoints: [
			{ id: 'cf-ips-retrieved', label: 'Cloudflare IPs retrieved via dig', completed: false, optional: false },
			{ id: 'hosts-updated', label: '/etc/hosts file updated with Cloudflare IPs', completed: false, optional: false },
			{ id: 'ssl-validated', label: 'SSL/TLS certificate validated locally', completed: false, optional: false },
			{ id: 'cache-tested', label: 'Cache behavior tested (cf-cache-status header)', completed: false, optional: false },
			{ id: 'rules-tested', label: 'Rules and WAF behavior validated', completed: false, optional: true },
		],
		documentation: [
			'https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/',
			'https://developers.cloudflare.com/cache/concepts/cache-responses/',
		],
	},
	{
		id: 'iterate-config',
		title: 'Iterate Configuration Until Satisfied',
		description:
			'Refine DNS records, SSL settings, WAF rules, caching policies, and other configurations based on local testing results. Repeat testing until ready.',
		checkpoints: [
			{ id: 'config-refined', label: 'Configuration adjusted based on test results', completed: false, optional: false },
			{ id: 'all-tests-passed', label: 'All functionality validated in test environment', completed: false, optional: false },
		],
		documentation: ['https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/'],
	},
	{
		id: 'handle-dnssec',
		title: 'Handle DNSSEC Migration',
		description:
			'If DNSSEC is active at your authoritative DNS, either disable it 24h before migration, or perform multi-signer DNSSEC migration.',
		checkpoints: [
			{ id: 'dnssec-status-checked', label: 'DNSSEC status at authoritative DNS verified', completed: false, optional: false },
			{ id: 'dnssec-disabled', label: 'DNSSEC disabled at authoritative DNS (if applicable)', completed: false, optional: true },
			{ id: 'multisigner-setup', label: 'Multi-signer DNSSEC configured (if applicable)', completed: false, optional: true },
		],
		documentation: [
			'https://developers.cloudflare.com/dns/dnssec/dnssec-active-migration/',
			'https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/#2-update-settings-in-authoritative-dns',
		],
	},
	{
		id: 'convert-full',
		title: 'Convert to Full Setup',
		description:
			'Convert your zone from Partial to Full Setup. Cloudflare will become your authoritative DNS provider. All records must remain DNS-only.',
		checkpoints: [
			{ id: 'records-still-unproxied', label: 'Confirmed all DNS records are DNS-only', completed: false, optional: false },
			{ id: 'zone-converted-full', label: 'Zone converted to Full Setup in dashboard', completed: false, optional: false },
			{ id: 'nameservers-noted', label: 'Assigned Cloudflare nameservers saved', completed: false, optional: false },
		],
		documentation: ['https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/#3-convert-to-full-setup'],
	},
	{
		id: 'lower-ttl',
		title: 'Lower TTL at Authoritative DNS',
		description:
			'Reduce TTL values for all DNS records at your current authoritative DNS provider to minimize propagation delay during nameserver change.',
		checkpoints: [
			{ id: 'ttl-lowered', label: 'TTL values reduced to 300-600 seconds', completed: false, optional: false },
			{ id: 'ttl-propagated', label: 'Waited for old TTL period to expire', completed: false, optional: false },
		],
		documentation: ['https://www.cloudflare.com/learning/cdn/glossary/time-to-live-ttl/'],
	},
	{
		id: 'change-nameservers',
		title: 'Update Nameservers at Registrar',
		description: 'Change nameservers at your domain registrar to the assigned Cloudflare nameservers. Monitor DNS propagation globally.',
		checkpoints: [
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
			'After full DNS propagation and certificate validation, enable proxied status on DNS records to activate Cloudflare reverse proxy and CDN features.',
		checkpoints: [
			{ id: 'cert-revalidated', label: 'SSL/TLS certificate is Active for all hostnames', completed: false, optional: false },
			{ id: 'origin-ips-allowed', label: 'Cloudflare IPs whitelisted at origin', completed: false, optional: false },
			{ id: 'proxy-enabled', label: 'Proxy status enabled on target DNS records', completed: false, optional: false },
			{ id: 'traffic-flowing', label: 'Traffic flowing through Cloudflare (cf-ray headers present)', completed: false, optional: false },
		],
		documentation: [
			'https://developers.cloudflare.com/dns/proxy-status/',
			'https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/',
			'https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/#update-proxy-status',
		],
	},
];

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// API endpoints
		if (url.pathname.startsWith('/api/')) {
			return handleApiRequest(url, request);
		}

		// Serve static assets
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

async function handleApiRequest(url: URL, request: Request): Promise<Response> {
	const headers = {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};

	if (request.method === 'OPTIONS') {
		return new Response(null, { headers });
	}

	// GET /api/steps - return migration steps
	if (url.pathname === '/api/steps' && request.method === 'GET') {
		const steps: MigrationStep[] = MIGRATION_STEPS.map((step) => ({
			...step,
			status: 'pending',
		}));
		return new Response(JSON.stringify({ steps }), { headers });
	}

	// GET /api/documentation - return documentation links
	if (url.pathname === '/api/documentation' && request.method === 'GET') {
		const documentation = {
			general: [
				'https://developers.cloudflare.com/fundamentals/performance/minimize-downtime/',
				'https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/',
			],
			partial_setup: ['https://developers.cloudflare.com/dns/zone-setups/partial-setup/setup/'],
			full_setup: ['https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/'],
			conversion: ['https://developers.cloudflare.com/dns/zone-setups/conversions/convert-partial-to-full/'],
			ssl: [
				'https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/',
				'https://developers.cloudflare.com/ssl/edge-certificates/changing-dcv-method/methods/txt/',
			],
			dnssec: [
				'https://developers.cloudflare.com/dns/dnssec/dnssec-active-migration/',
				'https://developers.cloudflare.com/dns/dnssec/multi-signer-dnssec/',
			],
			proxy: ['https://developers.cloudflare.com/dns/proxy-status/'],
		};
		return new Response(JSON.stringify(documentation), { headers });
	}

	return new Response(JSON.stringify({ error: 'Not found' }), {
		status: 404,
		headers,
	});
}
