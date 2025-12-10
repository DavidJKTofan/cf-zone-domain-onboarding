// src/types.ts

export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

export type SetupType = 'partial' | 'full';

export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SRV' | 'CAA' | 'DNSKEY';

export type ProxyStatus = 'proxied' | 'dns-only';

export type CertificateStatus = 'initializing' | 'pending_validation' | 'pending_issuance' | 'active' | 'validation_timed_out' | 'expired';

export interface Checkpoint {
	id: string;
	label: string;
	completed: boolean;
	optional: boolean;
}

export interface MigrationStep {
	id: string;
	title: string;
	description: string;
	status: StepStatus;
	checkpoints: Checkpoint[];
	documentation: string[];
}

export interface ZoneInfo {
	domain?: string;
	zoneId?: string;
	plan?: 'free' | 'pro' | 'business' | 'enterprise';
	setupType?: SetupType;
	nameservers?: string[];
	verificationTxtRecord?: {
		name: string;
		content: string;
	};
}

export interface DNSRecord {
	id?: string;
	type: DNSRecordType;
	name: string;
	content: string;
	ttl: number;
	proxied: boolean;
	priority?: number;
}

export interface Certificate {
	id?: string;
	type: 'universal' | 'advanced' | 'custom';
	status: CertificateStatus;
	hosts: string[];
	validationMethod?: 'txt' | 'http' | 'email';
	validationRecords?: Array<{
		txt_name: string;
		txt_value: string;
	}>;
	issuedOn?: string;
	expiresOn?: string;
}

export interface MigrationState {
	currentStep: number;
	steps: MigrationStep[];
	zoneInfo: ZoneInfo;
	dnssecEnabled: boolean;
	certificateOrdered: boolean;
	certificates?: Certificate[];
	dnsRecords?: DNSRecord[];
	testingPhaseCompleted: boolean;
	migrationStartedAt?: string;
	migrationCompletedAt?: string;
}

export interface DNSSECInfo {
	status: 'active' | 'disabled';
	dsRecord?: {
		keyTag: number;
		algorithm: number;
		digestType: number;
		digest: string;
	};
	multiSignerEnabled?: boolean;
	zskPublicKey?: string;
}

export interface LocalTestingInfo {
	cloudflareIPs: string[];
	hostsFileEntries: string[];
	testResults: {
		ssl: boolean;
		caching: boolean;
		waf: boolean;
		rules: boolean;
	};
}

export interface MigrationCheckpoint {
	stepId: string;
	checkpointId: string;
	timestamp: string;
	notes?: string;
}

export interface MigrationTimeline {
	events: MigrationCheckpoint[];
}

export interface APIResponse<T = any> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
	};
}

export interface StepsResponse {
	steps: MigrationStep[];
}

export interface DocumentationResponse {
	general: string[];
	partial_setup: string[];
	full_setup: string[];
	conversion: string[];
	ssl: string[];
	dnssec: string[];
	proxy: string[];
}

// Cloudflare API Types for reference
export interface CloudflareZone {
	id: string;
	name: string;
	status: 'active' | 'pending' | 'initializing' | 'moved' | 'deleted';
	paused: boolean;
	type: 'full' | 'partial';
	name_servers: string[];
	original_name_servers?: string[];
	original_registrar?: string;
	original_dnshost?: string;
	created_on: string;
	modified_on: string;
	activated_on?: string;
	account: {
		id: string;
		name: string;
	};
	plan: {
		id: string;
		name: string;
		legacy_id: string;
	};
}

export interface CloudflareDNSRecord {
	id: string;
	zone_id: string;
	zone_name: string;
	name: string;
	type: DNSRecordType;
	content: string;
	proxiable: boolean;
	proxied: boolean;
	ttl: number;
	locked: boolean;
	meta: {
		auto_added: boolean;
		managed_by_apps: boolean;
		managed_by_argo_tunnel: boolean;
	};
	created_on: string;
	modified_on: string;
}

export interface CloudflareCertificate {
	id: string;
	type: 'universal' | 'advanced' | 'custom';
	hosts: string[];
	status: CertificateStatus;
	validation_method: 'txt' | 'http' | 'email';
	validity_days: number;
	certificate_authority: 'google' | 'lets_encrypt';
	cloudflare_branding: boolean;
	validation_records?: Array<{
		txt_name: string;
		txt_value: string;
		http_url?: string;
		http_body?: string;
		emails?: string[];
	}>;
	issued_on?: string;
	expires_on?: string;
}

export interface CloudflareDNSSEC {
	status: 'active' | 'disabled' | 'pending';
	flags: number;
	algorithm: string;
	key_type: string;
	digest_type: string;
	digest_algorithm: string;
	digest: string;
	ds: string;
	key_tag: number;
	public_key: string;
	dnssec_multi_signer?: boolean;
}

// Worker Environment Types
export interface Env {
	ASSETS: Fetcher;
	// Add any KV, D1, or other bindings here if needed
	// MIGRATION_STATE?: KVNamespace;
}

// Request handler types
export type RequestHandler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response> | Response;
