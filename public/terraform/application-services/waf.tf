# Cloudflare Application Services - WAF Configuration (Provider v5)
# Web Application Firewall rules
#
# IMPORTANT v5 CHANGES:
# - 'rules' is now a list of objects: rules = [{ ... }] instead of rules { ... }
# - 'action_parameters' is now a single nested attribute
# - Block syntax changed to object/list syntax throughout
#
# BEST PRACTICE (from wiki):
# - Create ONE entrypoint ruleset in the 'http_request_firewall_managed' phase
# - Include multiple rules within that single resource (one per managed ruleset)
# - Do NOT create separate resources for each managed ruleset

# =============================================================================
# COMBINED WAF MANAGED RULESET (Cloudflare Managed + OWASP)
# Best Practice: Single entrypoint with multiple rules
# =============================================================================

resource "cloudflare_ruleset" "managed_waf_entrypoint" {
  count = var.enable_managed_waf ? 1 : 0

  zone_id     = data.cloudflare_zone.main.zone_id
  name        = "Managed WAF Entrypoint"
  description = "Zone-level WAF Managed Rules - ${var.domain}"
  kind        = "zone"
  phase       = "http_request_firewall_managed"

  # v5: rules as a list of objects - include all managed rulesets here
  rules = concat(
    # Rule 1: Cloudflare Managed Ruleset
    [
      {
        action      = "execute"
        expression  = "true"
        description = "Execute Cloudflare Managed Ruleset"
        enabled     = true
        action_parameters = {
          id = local.managed_ruleset_id
          # Uncomment to set default action (block, log, managed_challenge)
          # overrides = {
          #   action = "block"
          # }
        }
      }
    ],
    # Rule 2: OWASP Core Ruleset (if enabled)
    var.enable_owasp_ruleset ? [
      {
        action      = "execute"
        expression  = "true"
        description = "Execute OWASP Core Ruleset"
        enabled     = true
        action_parameters = {
          id = local.owasp_ruleset_id
          # OWASP configuration: Paranoia Level 1 (default), anomaly score 60
          # Uncomment and adjust as needed:
          # overrides = {
          #   # Disable higher paranoia levels for PL1 only
          #   categories = [
          #     { category = "paranoia-level-2", status = "disabled", enabled = true },
          #     { category = "paranoia-level-3", status = "disabled", enabled = true },
          #     { category = "paranoia-level-4", status = "disabled", enabled = true }
          #   ]
          #   # Set anomaly score threshold (default is 60)
          #   rules = [
          #     { id = local.owasp_anomaly_score_id, action = "block", score_threshold = 60 }
          #   ]
          # }
        }
      }
    ] : []
  )
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
# - Create ONE resource per phase with multiple rules inside
#
# Managed Ruleset IDs (defined in main.tf locals):
# - Cloudflare Managed: efb7b8c949ac4650a09736fc376e9aee
# - OWASP Core: 4814384a9e5d4991b9815dcfc25d2f1f
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
# 5. Combine all managed rulesets in ONE entrypoint resource
