// src/guides/cloudflare-one/sase-onboarding.ts

import type { MigrationStep } from '../../types';

/**
 * Comprehensive onboarding steps for Cloudflare One SASE & Zero Trust deployment
 * Based on official Cloudflare documentation, reference architecture, and internal best practices
 * 
 * Phase Structure:
 * - Phase 0: Preparation & Planning
 * - Phase 1: Foundation Setup (Account, IdP, Global Settings)
 * - Phase 2: Network Connectivity (Tunnel, WARP)
 * - Phase 3: Security Policies (DNS, HTTP, Network, Egress)
 * - Phase 4: Access Control (ZTNA, Device Posture)
 * - Phase 5: Advanced Security (DLP, RBI, CASB)
 * - Phase 6: Rollout & Operations
 */
export const SASE_ONBOARDING_STEPS: Omit<MigrationStep, 'status'>[] = [
    // ============================================================================
    // PHASE 0: PREPARATION & PLANNING
    // ============================================================================
    {
        id: 'planning',
        title: 'Planning & Architecture Design',
        description:
            'Before deployment, assess your current infrastructure, identify use cases (VPN replacement, SWG, ZTNA), and plan your rollout phases. Document your existing network topology, applications, user groups, and define success metrics. This planning phase is critical for a successful deployment.',
        estimatedTime: '2-4 hours',
        checkpoints: [
            { id: 'use-cases-identified', label: 'Primary use cases identified (VPN replacement, SWG, ZTNA, DLP)', completed: false, optional: false },
            { id: 'network-inventory', label: 'Network inventory documented (sites, private IP ranges, critical services)', completed: false, optional: false },
            { id: 'application-catalog', label: 'Application catalog created (web apps, SSH/RDP, thick clients)', completed: false, optional: false },
            { id: 'user-groups-mapped', label: 'User groups and access requirements mapped to IdP groups', completed: false, optional: false },
            { id: 'rollout-phases-defined', label: 'Phased rollout plan created (pilot → department → organization)', completed: false, optional: false },
            { id: 'critical-services-identified', label: 'Critical services identified (DNS, AD, SSO) for dedicated tunnels', completed: false, optional: true },
            { id: 'success-metrics-defined', label: 'Success metrics and KPIs defined', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/reference-architecture/architectures/sase/',
            'https://developers.cloudflare.com/cloudflare-one/implementation-guides/',
            'https://developers.cloudflare.com/learning-paths/replace-vpn/concepts/',
            'https://developers.cloudflare.com/learning-paths/secure-internet-traffic/concepts/',
        ],
        phase: 0,
        phaseTitle: 'Preparation',
    },

    // ============================================================================
    // PHASE 1: FOUNDATION SETUP
    // ============================================================================
    {
        id: 'create-account',
        title: 'Create Cloudflare One Account',
        description:
            'Set up your Cloudflare Zero Trust organization. This creates your team domain (e.g., yourcompany.cloudflareaccess.com) and provides access to the Cloudflare One dashboard where you will configure all security policies, tunnels, and device settings.',
        estimatedTime: '10 minutes',
        checkpoints: [
            { id: 'zt-account-created', label: 'Zero Trust organization created', completed: false, optional: false },
            { id: 'team-domain-configured', label: 'Team domain configured (e.g., yourcompany.cloudflareaccess.com)', completed: false, optional: false },
            { id: 'admin-access-verified', label: 'Admin access to Zero Trust dashboard verified', completed: false, optional: false },
            { id: 'billing-plan-selected', label: 'Appropriate plan selected (Free, Standard, Enterprise)', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/setup/',
            'https://developers.cloudflare.com/cloudflare-one/faq/getting-started-faq/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/',
        phase: 1,
        phaseTitle: 'Foundation Setup',
    },
    {
        id: 'identity-provider',
        title: 'Integrate Identity Provider (IdP)',
        description:
            'Connect your identity provider (Okta, Microsoft Entra ID, Google Workspace, etc.) for user authentication. This enables SSO and allows you to use identity attributes in access policies. Configure SCIM for automatic user/group synchronization. Best Practice: Require MFA for all IdP authentication.',
        estimatedTime: '30 minutes - 1 hour',
        checkpoints: [
            { id: 'idp-connected', label: 'Primary identity provider connected and tested', completed: false, optional: false },
            { id: 'scim-configured', label: 'SCIM provisioning configured for automatic user/group sync', completed: false, optional: false },
            { id: 'mfa-enforced', label: 'MFA enforcement verified at IdP level', completed: false, optional: false },
            { id: 'sso-tested', label: 'Single sign-on tested with test user', completed: false, optional: false },
            { id: 'idp-groups-synced', label: 'Relevant IdP groups synced for policy use', completed: false, optional: false },
            { id: 'session-lifetime-configured', label: 'Azure AD/Okta session lifetime configured for re-auth flows', completed: false, optional: true },
            { id: 'additional-idps', label: 'Additional IdPs configured for contractors/partners', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/',
            'https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/okta/',
            'https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/entra-id/',
            'https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google/',
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/users/scim/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/integrations/identity-providers',
        phase: 1,
        phaseTitle: 'Foundation Setup',
    },
    {
        id: 'global-settings',
        title: 'Configure Global Zero Trust Settings',
        description:
            'Configure organization-wide settings including custom block pages, authentication domain, and logging preferences. These settings apply across all Zero Trust features and should be configured before creating policies.',
        estimatedTime: '15-30 minutes',
        checkpoints: [
            { id: 'block-page-customized', label: 'Gateway block page customized with company branding', completed: false, optional: false },
            { id: 'access-block-page', label: 'Access block page customized for authentication failures', completed: false, optional: false },
            { id: 'auth-domain-configured', label: 'Authentication domain configured', completed: false, optional: false },
            { id: 'logging-retention-set', label: 'Gateway Logs configured', completed: false, optional: false },
            { id: 'support-url-configured', label: 'Custom support URL configured for user help', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/reusable-components/custom-pages/',
            'https://developers.cloudflare.com/cloudflare-one/insights/logs/gateway-logs/',
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/reusable-components/custom-pages',
        phase: 1,
        phaseTitle: 'Foundation Setup',
    },

    // ============================================================================
    // PHASE 2: NETWORK CONNECTIVITY
    // ============================================================================
    {
        id: 'connect-private-network',
        title: 'Deploy Cloudflare Tunnel for Private Networks',
        description:
            'Deploy Cloudflare Tunnel (cloudflared) to connect your private network and internal applications to Cloudflare. Best Practices: Deploy in isolated DMZ network, minimum 2 replicas per tunnel for HA, use QUIC protocol (UDP/7844), distribute critical services across separate tunnels, monitor cloudflared servers for bottlenecks.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'tunnel-created', label: 'Cloudflare Tunnel created in dashboard (remotely-managed)', completed: false, optional: false },
            { id: 'cloudflared-installed', label: 'cloudflared installed on connector host(s) in DMZ/isolated network/Jumphost/Gateway Server', completed: false, optional: false },
            { id: 'tunnel-quic-verified', label: 'Tunnel using QUIC protocol verified (UDP/7844 egress allowed)', completed: false, optional: false },
            { id: 'tunnel-running', label: 'Tunnel connected and showing healthy status', completed: false, optional: false },
            { id: 'private-routes-configured', label: 'Public hostname(s) / Private network IP(s)/CIDR routes configured', completed: false, optional: false },
            { id: 'tunnel-replicas', label: 'Minimum 2 tunnel replicas deployed for high availability', completed: false, optional: false },
            { id: 'file-descriptors-increased', label: 'Linux file descriptors increased (100000) for high traffic', completed: false, optional: true },
            { id: 'ephemeral-ports-increased', label: 'Ephemeral ports range expanded (12000-60999)', completed: false, optional: true },
            { id: 'tunnel-health-alerts', label: 'Tunnel health alerts configured', completed: false, optional: true },
            { id: 'critical-services-tunnel', label: 'Dedicated tunnel(s) created for critical services (DNS, AD)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/',
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/private-net/cloudflared/',
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/tunnel-availability/',
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/monitor-tunnels/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/networks/connectors',
        phase: 2,
        phaseTitle: 'Network Connectivity',
    },
    {
        id: 'warp-deployment',
        title: 'Deploy WARP Client to Devices',
        description:
            'Configure device enrollment policies and deploy the Cloudflare WARP client. Best Practices: Use IdP groups + MFA for enrollment, configure device profiles per user type (remote, office, contractors), use Exclude mode with RFC1918 modifications, lock WARP switch in production, enable multi-user mode from start.',
        estimatedTime: '2-4 hours',
        checkpoints: [
            { id: 'enrollment-rules-created', label: 'Device enrollment rules with IdP groups and MFA requirement', completed: false, optional: false },
            { id: 'warp-profile-configured', label: 'WARP device profile configured (Gateway with WARP mode)', completed: false, optional: false },
            { id: 'split-tunnel-configured', label: 'Split Tunnel configured (Exclude mode, RFC1918 adjusted)', completed: false, optional: false },
            { id: 'root-cert-deployed', label: 'Cloudflare root certificate deployed to devices', completed: false, optional: false },
            { id: 'lock-warp-switch', label: 'Lock WARP switch enabled (production setting)', completed: false, optional: false },
            { id: 'warp-pilot-deployed', label: 'WARP client deployed to pilot users', completed: false, optional: false },
            { id: 'managed-network-configured', label: 'Managed Network detection configured (IP-based, not FQDN)', completed: false, optional: true },
            { id: 'mdm-integration', label: 'MDM integration configured (Intune, JAMF, etc.)', completed: false, optional: true },
            { id: 'multi-user-mode', label: 'Multi-user mode enabled for shared devices', completed: false, optional: true },
            { id: 'auto-connect-configured', label: 'Auto-connect configured with appropriate timeout', completed: false, optional: true },
            { id: 'o365-direct-route', label: 'Office 365 direct routing enabled (if no tenant restrictions)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/warp/',
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/warp/deployment/',
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/warp/configure-warp/route-traffic/split-tunnels/',
            'https://developers.cloudflare.com/learning-paths/replace-vpn/configure-device-agent/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/settings/warp-client',
        phase: 2,
        phaseTitle: 'Network Connectivity',
    },

    // ============================================================================
    // PHASE 3: SECURITY POLICIES (GATEWAY)
    // ============================================================================
    {
        id: 'gateway-dns',
        title: 'Configure Gateway DNS Policies',
        description:
            'Set up DNS filtering policies to block malicious domains, restrict content categories, and control DNS resolution. Follow naming convention: <Source>-DNS-<Destination>-<Purpose>. Recommended order: 1) Whitelist trusted domains, 2) Block security categories, 3) Block content categories, 4) Block applications, 5) Block geo-restricted IPs.',
        estimatedTime: '30 minutes - 1 hour',
        checkpoints: [
            { id: 'dns-whitelist-created', label: 'Corporate/trusted domains whitelist policy created (Priority 1)', completed: false, optional: false },
            { id: 'security-categories-blocked', label: 'All security threat categories blocked (malware, phishing, C2)', completed: false, optional: false },
            { id: 'content-categories-configured', label: 'Content filtering categories configured (Questionable, Security Risks)', completed: false, optional: false },
            { id: 'app-blacklist-dns', label: 'Unauthorized applications blocked (Shadow IT)', completed: false, optional: false },
            { id: 'geo-ip-blocked', label: 'High-risk country geo-IP blocking configured (OFAC, EAR, ITAR)', completed: false, optional: true },
            { id: 'tld-blacklist', label: 'Misused TLDs blocked (.zip, .mobi, .top, etc.)', completed: false, optional: true },
            { id: 'phishing-domain-regex', label: 'Phishing domain regex rules created (brand impersonation)', completed: false, optional: true },
            { id: 'custom-blocklists', label: 'Custom IP/domain blocklists created for threat intel', completed: false, optional: true },
            { id: 'dns-block-page-enabled', label: 'Block page enabled for DNS policies', completed: false, optional: false },
            { id: 'dns-logs-verified', label: 'DNS query logs verified in analytics', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/dns-policies/',
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/initial-setup/dns/',
            'https://developers.cloudflare.com/learning-paths/secure-internet-traffic/build-dns-policies/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/dns',
        phase: 3,
        phaseTitle: 'Security Policies',
    },
    {
        id: 'gateway-network',
        title: 'Configure Gateway Network Policies',
        description:
            'Create network-level policies to control TCP/UDP traffic to internal resources. Implement Zero Trust implicit deny: only explicitly allowed traffic reaches internal networks. Include quarantine policies for compromised users and posture-fail restrictions.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'proxy-tcp-udp-enabled', label: 'Gateway proxy enabled for TCP, UDP, and ICMP', completed: false, optional: false },
            { id: 'quarantine-policy', label: 'Quarantined users restriction policy created', completed: false, optional: false },
            { id: 'posture-fail-policy', label: 'Device posture fail restriction policy created', completed: false, optional: false },
            { id: 'internal-access-policies', label: 'Internal resource access policies created (per user group)', completed: false, optional: false },
            { id: 'network-blacklist', label: 'Network-level blacklist policy for malicious IPs/SNIs', completed: false, optional: false },
            { id: 'ssh-whitelist', label: 'SSH access whitelist for specific users/destinations', completed: false, optional: true },
            { id: 'non-web-block', label: 'Non-HTTP/HTTPS Internet traffic blocked (Detected Protocol)', completed: false, optional: true },
            { id: 'implicit-deny', label: 'Implicit deny policy at bottom for internal network ranges', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/network-policies/',
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/initial-setup/network/',
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/network-policies/common-policies/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/network',
        phase: 3,
        phaseTitle: 'Security Policies',
    },
    {
        id: 'gateway-http',
        title: 'Configure Gateway HTTP Policies',
        description:
            'Enable HTTP inspection and create policies to control web traffic. Configure TLS decryption, antivirus scanning, file type blocking, and content policies. Include Do Not Inspect rules for certificate-pinned applications and sensitive categories.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'tls-decryption-enabled', label: 'TLS decryption enabled', completed: false, optional: false },
            { id: 'do-not-inspect-apps', label: 'Do Not Inspect policy for cert-pinned applications', completed: false, optional: false },
            { id: 'do-not-inspect-android', label: 'Do Not Inspect policy for Android-specific apps (Google Drive)', completed: false, optional: true },
            { id: 'do-not-inspect-categories', label: 'Do Not Inspect for sensitive categories (Health, Finance, Gov)', completed: false, optional: true },
            { id: 'do-not-inspect-internal', label: 'Do Not Inspect for internal network traffic', completed: false, optional: false },
            { id: 'http-whitelist', label: 'Corporate/trusted domain whitelist policy created', completed: false, optional: false },
            { id: 'security-risks-blocked', label: 'All security risks blocked (malware, C2, botnet)', completed: false, optional: false },
            { id: 'antivirus-enabled', label: 'Antivirus scanning enabled for uploads/downloads', completed: false, optional: false },
            { id: 'file-type-controls', label: 'Risky file type blocking configured', completed: false, optional: false },
            { id: 'content-categories-http', label: 'Content category blocking/isolation configured', completed: false, optional: false },
            { id: 'app-blacklist-http', label: 'Unauthorized applications blocked (Shadow IT)', completed: false, optional: false },
            { id: 'privileged-user-isolation', label: 'Privileged users traffic isolation policy created', completed: false, optional: true },
            { id: 'risky-domain-isolation', label: 'Risky/new domains isolation policy created', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/http-policies/',
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/initial-setup/http/',
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/http-policies/tls-decryption/',
            'https://developers.cloudflare.com/learning-paths/secure-internet-traffic/build-http-policies/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/http',
        phase: 3,
        phaseTitle: 'Security Policies',
    },
    {
        id: 'resolver-policies',
        title: 'Configure Resolver Policies (Private DNS)',
        description:
            'Configure resolver policies to route DNS queries for internal hostnames to your private DNS servers. This enables hostname-based routing to private resources and replaces Local Domain Fallback for most use cases.',
        estimatedTime: '30 minutes',
        checkpoints: [
            { id: 'internal-dns-routes', label: 'Private DNS server routes configured via tunnel', completed: false, optional: false },
            { id: 'resolver-policies-created', label: 'Resolver policies created for internal domains', completed: false, optional: false },
            { id: 'private-hostname-routing', label: 'Private hostname routing tested and verified', completed: false, optional: false },
            { id: 'ldf-removed', label: 'Local Domain Fallback entries removed (use resolver policies)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/resolver-policies/',
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/private-net/cloudflared/connect-private-hostname/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/resolver',
        phase: 3,
        phaseTitle: 'Security Policies',
    },

    // ============================================================================
    // PHASE 4: ACCESS CONTROL (ZTNA)
    // ============================================================================
    {
        id: 'access-applications',
        title: 'Configure Access Applications (ZTNA)',
        description:
            'Create Access applications to protect internal web apps, SSH servers, and RDP endpoints. Implement the BeyondCorp model: migrate from VPN access to Access-protected applications. Best Practices: Validate JWT tokens at application layer, use path-based rules, configure session timeouts.',
        estimatedTime: '2-4 hours',
        checkpoints: [
            { id: 'web-apps-catalog', label: 'Web applications catalog reviewed and prioritized', completed: false, optional: false },
            { id: 'self-hosted-apps-added', label: 'Self-hosted web applications added to Access', completed: false, optional: false },
            { id: 'access-policies-created', label: 'Access policies created with identity/group requirements', completed: false, optional: false },
            { id: 'mfa-requirements', label: 'MFA requirements enforced in policies', completed: false, optional: false },
            { id: 'session-duration', label: 'Session duration configured per application sensitivity', completed: false, optional: false },
            { id: 'jwt-validation-docs', label: 'JWT validation documentation provided to app teams', completed: false, optional: true },
            { id: 'ssh-browser-rendering', label: 'SSH Browser Rendering configured for admin access', completed: false, optional: true },
            { id: 'rdp-browser-rendering', label: 'RDP Browser Rendering (or Guacamole) configured', completed: false, optional: true },
            { id: 'app-launcher-configured', label: 'App Launcher configured for user portal', completed: false, optional: true },
            { id: 'saas-apps-configured', label: 'SaaS application integrations configured', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/applications/',
            'https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/',
            'https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/',
            'https://developers.cloudflare.com/reference-architecture/design-guides/designing-ztna-access-policies/',
            'https://developers.cloudflare.com/learning-paths/replace-vpn/build-policies/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/access/apps',
        phase: 4,
        phaseTitle: 'Access Control',
    },
    {
        id: 'device-posture',
        title: 'Configure Device Posture Checks',
        description:
            'Integrate with endpoint security tools (CrowdStrike, Microsoft Intune, SentinelOne, etc.) and define device posture requirements. Create baseline posture checks (OS version, disk encryption, domain joined) and integrate with network/access policies.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'warp-posture-checks', label: 'WARP client posture checks enabled (OS version, disk encryption)', completed: false, optional: false },
            { id: 'posture-providers-integrated', label: 'Third-party posture providers integrated (CrowdStrike, Intune)', completed: false, optional: true },
            { id: 'baseline-posture-defined', label: 'Baseline posture requirements defined for organization', completed: false, optional: false },
            { id: 'posture-policies-network', label: 'Posture requirements added to Gateway network policies', completed: false, optional: false },
            { id: 'posture-policies-access', label: 'Posture requirements added to Access policies for critical apps', completed: false, optional: false },
            { id: 'device-info-only-mode', label: 'Device Information Only mode evaluated for posture-only checks', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/reusable-components/posture-checks/',
            'https://developers.cloudflare.com/cloudflare-one/reusable-components/posture-checks/warp-client-checks/',
            'https://developers.cloudflare.com/cloudflare-one/integrations/service-providers/',
            'https://developers.cloudflare.com/learning-paths/replace-vpn/configure-device-agent/device-posture/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/settings/warp-client/device-posture',
        phase: 4,
        phaseTitle: 'Access Control',
    },
    {
        id: 'warp-session-timeout',
        title: 'Configure WARP Session Timeout (Re-authentication)',
        description:
            'Configure WARP session timeouts to require periodic re-authentication. Best Practice: Set 12-hour timeout for balance between security and UX. Exclude basic services (DNS, IdP, MDM) from timeout to ensure re-auth works properly.',
        estimatedTime: '30 minutes',
        checkpoints: [
            { id: 'session-timeout-planned', label: 'Session timeout duration decided (recommended: 12 hours)', completed: false, optional: false },
            { id: 'basic-services-excluded', label: 'Basic services excluded from timeout (DNS, IdP, MDM, AD)', completed: false, optional: false },
            { id: 'timeout-policies-consistent', label: 'Same timeout applied across Network and HTTP policies', completed: false, optional: false },
            { id: 'internal-only-timeout', label: 'Timeout applied to internal resources only (not Internet)', completed: false, optional: true },
            { id: 'session-timeout-tested', label: 'Re-authentication flow tested with pilot users', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/warp/configure-warp/warp-sessions/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/network',
        phase: 4,
        phaseTitle: 'Access Control',
    },

    // ============================================================================
    // PHASE 5: ADVANCED SECURITY
    // ============================================================================
    {
        id: 'dlp-policies',
        title: 'Configure Data Loss Prevention (DLP)',
        description:
            'Define DLP profiles to detect and protect sensitive data (PII, financial data, credit cards, source code). Create HTTP policies to block or log sensitive data in uploads and downloads. Integrate DLP with Browser Isolation for copy/paste controls.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'dlp-profiles-created', label: 'DLP profiles created for sensitive data types (PII, PCI, PHI)', completed: false, optional: false },
            { id: 'dlp-http-policies', label: 'DLP detection integrated with HTTP policies', completed: false, optional: false },
            { id: 'upload-controls', label: 'Upload controls configured for sensitive destinations', completed: false, optional: true },
            { id: 'download-scanning', label: 'Download scanning enabled for DLP detection', completed: false, optional: true },
            { id: 'dlp-alerts-configured', label: 'DLP violation alerts configured', completed: false, optional: true },
            { id: 'dlp-logs-verified', label: 'DLP logs and detections verified in analytics', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/',
            'https://developers.cloudflare.com/cloudflare-one/data-loss-prevention/dlp-profiles/',
            'https://developers.cloudflare.com/learning-paths/secure-internet-traffic/build-http-policies/data-loss-prevention/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/dlp/profiles',
        phase: 5,
        phaseTitle: 'Advanced Security',
    },
    {
        id: 'browser-isolation',
        title: 'Enable Browser Isolation (RBI)',
        description:
            'Configure Remote Browser Isolation to isolate risky web browsing. Traffic is rendered in Cloudflare\'s cloud and only safe pixels are sent to the user device. Use for: risky categories, new/unknown domains, privileged users, and sensitive applications.',
        estimatedTime: '30 minutes - 1 hour',
        checkpoints: [
            { id: 'rbi-enabled', label: 'Remote Browser Isolation enabled for organization', completed: false, optional: false },
            { id: 'clientless-rbi-enabled', label: 'Clientless Browser Isolation enabled', completed: false, optional: true },
            { id: 'rbi-risky-sites', label: 'Isolation policy created for risky categories/new domains', completed: false, optional: false },
            { id: 'rbi-privileged-users', label: 'Isolation policy created for privileged/security users', completed: false, optional: true },
            { id: 'rbi-access-apps', label: 'Isolation enabled for sensitive Access applications', completed: false, optional: true },
            { id: 'clipboard-controls', label: 'Clipboard, print, and download controls configured', completed: false, optional: true },
            { id: 'rbi-tested', label: 'Isolation behavior tested with pilot users', completed: false, optional: false },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/remote-browser-isolation/',
            'https://developers.cloudflare.com/cloudflare-one/remote-browser-isolation/setup/',
            'https://developers.cloudflare.com/cloudflare-one/remote-browser-isolation/setup/clientless-browser-isolation/',
            'https://developers.cloudflare.com/cloudflare-one/policies/access/isolate-application/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/http',
        phase: 5,
        phaseTitle: 'Advanced Security',
    },
    {
        id: 'casb-shadow-it',
        title: 'Configure CASB & Shadow IT Discovery',
        description:
            'Enable Shadow IT discovery to identify unauthorized SaaS applications in use. Configure API-driven CASB integrations to scan connected SaaS apps for misconfigurations, data exposure, and compliance violations.',
        estimatedTime: '1-2 hours',
        checkpoints: [
            { id: 'shadow-it-enabled', label: 'Shadow IT discovery enabled', completed: false, optional: false },
            { id: 'shadow-it-reviewed', label: 'Shadow IT report reviewed with security team', completed: false, optional: false },
            { id: 'sanctioned-apps-defined', label: 'Sanctioned vs unsanctioned applications defined', completed: false, optional: false },
            { id: 'casb-integrations', label: 'CASB integrations connected (Google Workspace, M365, etc.)', completed: false, optional: true },
            { id: 'casb-findings-reviewed', label: 'CASB security findings reviewed and prioritized', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/insights/analytics/shadow-it-discovery/',
            'https://developers.cloudflare.com/cloudflare-one/integrations/cloud-and-saas/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/insights/shadow-it',
        phase: 5,
        phaseTitle: 'Advanced Security',
    },
    {
        id: 'egress-policies',
        title: 'Configure Egress Policies (Dedicated IPs)',
        description:
            'Configure egress policies to assign dedicated egress IP addresses unique to your organization. Use virtual networks to allow users to select country-specific egress IPs for localized content access.',
        estimatedTime: '30 minutes',
        checkpoints: [
            { id: 'dedicated-egress-enabled', label: 'Dedicated egress IPs provisioned (if licensed)', completed: false, optional: true },
            { id: 'egress-policies-created', label: 'Egress policies created for IP assignment', completed: false, optional: true },
            { id: 'virtual-networks-egress', label: 'Virtual networks configured for regional egress selection', completed: false, optional: true },
            { id: 'egress-verified', label: 'Egress IP verified with external services', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/traffic-policies/egress-policies/',
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/private-net/cloudflared/tunnel-virtual-networks/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/gateway/egress',
        phase: 5,
        phaseTitle: 'Advanced Security',
    },

    // ============================================================================
    // PHASE 6: ROLLOUT & OPERATIONS
    // ============================================================================
    {
        id: 'testing-validation',
        title: 'Testing & Validation',
        description:
            'Thoroughly test all configurations with pilot users before broader rollout. Validate connectivity, policy enforcement, and user experience across different scenarios (office, remote, mobile).',
        estimatedTime: '2-4 hours',
        checkpoints: [
            { id: 'pilot-group-defined', label: 'Pilot user group defined (IT/Security team first)', completed: false, optional: false },
            { id: 'private-app-access', label: 'Private application access verified through tunnel', completed: false, optional: false },
            { id: 'dns-filtering-tested', label: 'DNS filtering blocks verified (test malicious domain)', completed: false, optional: false },
            { id: 'http-filtering-tested', label: 'HTTP filtering and TLS inspection verified', completed: false, optional: false },
            { id: 'access-policies-tested', label: 'Access application policies tested (allow/deny scenarios)', completed: false, optional: false },
            { id: 'posture-checks-tested', label: 'Device posture enforcement tested', completed: false, optional: false },
            { id: 'logs-reviewed', label: 'Logs and analytics reviewed for anomalies', completed: false, optional: false },
            { id: 'user-feedback-collected', label: 'User feedback collected and issues addressed', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/insights/analytics/',
            'https://developers.cloudflare.com/cloudflare-one/insights/logs/',
            'https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/warp/troubleshooting/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/insights/analytics',
        phase: 6,
        phaseTitle: 'Rollout & Operations',
    },
    {
        id: 'production-rollout',
        title: 'Production Rollout',
        description:
            'Roll out to production users in phases. Start with IT/Security team, then expand to departments, and finally organization-wide. Monitor logs and analytics during each phase. Communicate changes to users with support resources.',
        estimatedTime: '1-4 weeks',
        checkpoints: [
            { id: 'phase1-rollout', label: 'Phase 1: IT/Security team fully onboarded', completed: false, optional: false },
            { id: 'phase2-rollout', label: 'Phase 2: Department-level rollout completed', completed: false, optional: false },
            { id: 'phase3-rollout', label: 'Phase 3: Organization-wide rollout completed', completed: false, optional: false },
            { id: 'user-communication', label: 'User communication and training completed', completed: false, optional: false },
            { id: 'support-runbook', label: 'IT support runbook created for common issues', completed: false, optional: false },
            { id: 'legacy-vpn-decommissioned', label: 'Legacy VPN decommissioned (if applicable)', completed: false, optional: true },
            { id: 'warp-only-users', label: 'WARP-only users minimized (most use Access apps)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/implementation-guides/',
            'https://developers.cloudflare.com/learning-paths/replace-vpn/deployment/',
        ],
        phase: 6,
        phaseTitle: 'Rollout & Operations',
    },
    {
        id: 'ongoing-operations',
        title: 'Ongoing Operations & Optimization',
        description:
            'Establish operational procedures for ongoing management. Set up alerting, configure log export to SIEM, review policies regularly, and maintain cloudflared/WARP client updates. Consider Infrastructure as Code (Terraform) for policy management.',
        estimatedTime: 'Ongoing',
        checkpoints: [
            { id: 'alerting-configured', label: 'Alerting configured for security events and tunnel health', completed: false, optional: false },
            { id: 'log-export-configured', label: 'Log export to SIEM configured (Logpush)', completed: false, optional: true },
            { id: 'cloudflared-updates', label: 'cloudflared update process documented and scheduled', completed: false, optional: false },
            { id: 'warp-updates', label: 'WARP client update process via MDM documented', completed: false, optional: false },
            { id: 'regular-review-scheduled', label: 'Monthly policy review cadence established', completed: false, optional: false },
            { id: 'policy-naming-convention', label: 'Policy naming convention documented and enforced', completed: false, optional: true },
            { id: 'incident-response-updated', label: 'Incident response procedures updated for ZT', completed: false, optional: true },
            { id: 'terraform-iac', label: 'Infrastructure as Code (Terraform) implemented', completed: false, optional: true },
            { id: 'monitoring-dashboards', label: 'Monitoring dashboards created (Grafana/Prometheus)', completed: false, optional: true },
        ],
        documentation: [
            'https://developers.cloudflare.com/cloudflare-one/insights/analytics/',
            'https://developers.cloudflare.com/cloudflare-one/insights/logs/logpush/',
            'https://developers.cloudflare.com/terraform/cloudflare-one/',
            'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/update-cloudflared/',
        ],
        dashboardLink: 'https://one.dash.cloudflare.com/?to=/:account/insights/analytics',
        phase: 6,
        phaseTitle: 'Rollout & Operations',
    },
];

export const GUIDE_METADATA = {
    id: 'sase-onboarding',
    slug: 'sase-onboarding',
    title: 'SASE & Zero Trust Onboarding',
    shortTitle: 'SASE Onboarding',
    description: 'Comprehensive guide to deploy Cloudflare One SASE platform with Zero Trust security for your organization. Covers VPN replacement, SWG, ZTNA, and advanced security features.',
    category: 'cloudflare-one' as const,
    status: 'available' as const,
    icon: 'shield',
    estimatedDuration: '2-4 weeks',
    tags: ['sase', 'zero-trust', 'ztna', 'swg', 'vpn-replacement', 'gateway', 'access', 'tunnel', 'warp'],
    version: '2026.2',
};
