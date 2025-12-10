// src/index.ts
import type { Env, MigrationStep, StepsResponse, DocumentationResponse } from './types';
import { MIGRATION_STEPS } from './migration-steps';

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
