# Cloudflare Application Services - WAF Configuration (Provider v5)
# Web Application Firewall rules
#
# IMPORTANT v5 CHANGES:
# - 'rules' is now a list of objects: rules = [{ ... }] instead of rules { ... }
# - 'action_parameters' is now a single nested attribute
# - Block syntax changed to object/list syntax throughout

# =============================================================================
# CLOUDFLARE MANAGED WAF RULESET
# =============================================================================

resource "cloudflare_ruleset" "managed_waf" {
  count = var.enable_managed_waf ? 1 : 0

  zone_id     = data.cloudflare_zone.main.zone_id
  name        = "Cloudflare Managed Ruleset"
  description = "Deploy Cloudflare Managed WAF rules"
  kind        = "zone"
  phase       = "http_request_firewall_managed"

  # v5: rules is now a list of objects
  rules = [
    {
      action = "execute"
      action_parameters = {
        id = "efb7b8c949ac4650a09736fc376e9aee" # Cloudflare Managed Ruleset ID
      }
      expression  = "true"
      description = "Execute Cloudflare Managed Ruleset"
      enabled     = true
    }
  ]
}

# =============================================================================
# OWASP CORE RULESET
# =============================================================================

resource "cloudflare_ruleset" "owasp" {
  count = var.enable_owasp_ruleset ? 1 : 0

  zone_id     = data.cloudflare_zone.main.zone_id
  name        = "OWASP Core Ruleset"
  description = "Deploy OWASP ModSecurity Core Ruleset"
  kind        = "zone"
  phase       = "http_request_firewall_managed"

  # v5: rules is now a list of objects
  rules = [
    {
      action = "execute"
      action_parameters = {
        id = "4814384a9e5d4991b9815dcfc25d2f1f" # OWASP Core Ruleset ID
      }
      expression  = "true"
      description = "Execute OWASP Core Ruleset"
      enabled     = true
    }
  ]

  depends_on = [cloudflare_ruleset.managed_waf]
}

# =============================================================================
# CUSTOM WAF RULES (Examples - uncomment and customize)
# =============================================================================

# resource "cloudflare_ruleset" "custom_waf" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Custom WAF Rules"
#   description = "Custom WAF rules for ${var.domain}"
#   kind        = "zone"
#   phase       = "http_request_firewall_custom"
#
#   # v5: rules as list of objects
#   rules = [
#     {
#       action      = "block"
#       expression  = "ip.geoip.country in {\"XX\"}"
#       description = "Block specific countries"
#       enabled     = true
#     },
#     {
#       action      = "managed_challenge"
#       expression  = "http.request.uri.path matches \"^/admin\""
#       description = "Challenge admin access"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# RATE LIMITING (Examples - uncomment and customize)
# =============================================================================

# resource "cloudflare_ruleset" "rate_limiting" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Rate Limiting"
#   description = "Rate limiting rules"
#   kind        = "zone"
#   phase       = "http_ratelimit"
#
#   # v5: rules as list of objects, ratelimit as nested object
#   rules = [
#     {
#       action = "block"
#       ratelimit = {
#         characteristics     = ["cf.colo.id", "ip.src"]
#         period              = 60
#         requests_per_period = 100
#         mitigation_timeout  = 600
#       }
#       expression  = "http.request.uri.path matches \"^/api/\""
#       description = "API Rate Limit: 100 req/min"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# IP ACCESS RULES (Examples - uncomment and customize)
# =============================================================================

# # Allowlist office IP
# resource "cloudflare_access_rule" "office" {
#   zone_id = data.cloudflare_zone.main.zone_id
#   mode    = "whitelist"
#   notes   = "Office IP range"
#
#   configuration = {
#     target = "ip_range"
#     value  = "203.0.113.0/24"
#   }
# }

# =============================================================================
# WAF NOTES
# =============================================================================
#
# v5 Migration Notes for Rulesets:
# - rules { ... } → rules = [{ ... }]
# - action_parameters { ... } → action_parameters = { ... }
# - All nested blocks become nested attributes with = syntax
#
# Action Types:
# - block: Block the request
# - managed_challenge: Cloudflare's smart challenge (RECOMMENDED)
# - js_challenge: JavaScript challenge
# - log: Log but allow
# - skip: Skip remaining rules
#
# Best Practices:
# 1. Start with "log" action to monitor before blocking
# 2. Use managed_challenge over legacy challenges
# 3. Test rules in development first
# 4. Monitor Security Events in dashboard
