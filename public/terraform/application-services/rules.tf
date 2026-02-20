# Cloudflare Application Services - Rules Configuration (Provider v5)
# Transform rules, redirects, and configuration rules
#
# IMPORTANT v5 CHANGES:
# - All block syntax changed to nested attribute syntax with =
# - rules { ... } → rules = [{ ... }]
# - action_parameters { ... } → action_parameters = { ... }
#
# All rules in this file are EXAMPLES - uncomment and customize as needed

# =============================================================================
# REDIRECT RULES (Examples)
# =============================================================================

# resource "cloudflare_ruleset" "redirects" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Redirect Rules"
#   description = "URL redirects"
#   kind        = "zone"
#   phase       = "http_request_dynamic_redirect"
#
#   # v5: rules as list of objects
#   rules = [
#     {
#       action = "redirect"
#       action_parameters = {
#         from_value = {
#           status_code = 301
#           target_url = {
#             expression = "concat(\"https://${var.domain}\", http.request.uri.path)"
#           }
#           preserve_query_string = true
#         }
#       }
#       expression  = "http.host eq \"www.${var.domain}\""
#       description = "WWW to non-WWW redirect"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# URL REWRITE RULES (Examples)
# =============================================================================

# resource "cloudflare_ruleset" "rewrites" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "URL Rewrites"
#   description = "URL rewrite rules"
#   kind        = "zone"
#   phase       = "http_request_transform"
#
#   # v5: rules as list of objects
#   rules = [
#     {
#       action = "rewrite"
#       action_parameters = {
#         uri = {
#           path = {
#             expression = "regex_replace(http.request.uri.path, \"/$\", \"\")"
#           }
#         }
#       }
#       expression  = "http.request.uri.path ne \"/\" and ends_with(http.request.uri.path, \"/\")"
#       description = "Remove trailing slash"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# HEADER MODIFICATION RULES (Examples)
# v5: headers is now a map keyed by header name
# =============================================================================

# resource "cloudflare_ruleset" "headers" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Header Modifications"
#   description = "HTTP header modifications"
#   kind        = "zone"
#   phase       = "http_request_late_transform"
#
#   # v5: rules as list of objects, headers as map
#   rules = [
#     {
#       action = "rewrite"
#       action_parameters = {
#         headers = {
#           "X-Custom-Header" = {
#             operation = "set"
#             value     = "custom-value"
#           }
#         }
#       }
#       expression  = "true"
#       description = "Add custom header"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# CONFIGURATION RULES (Examples)
# Per-request settings override
# =============================================================================

# resource "cloudflare_ruleset" "config" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Configuration Rules"
#   description = "Per-request settings"
#   kind        = "zone"
#   phase       = "http_config_settings"
#
#   # v5: rules as list of objects
#   rules = [
#     {
#       action = "set_config"
#       action_parameters = {
#         cache = false
#       }
#       expression  = "http.request.uri.path matches \"^/admin\""
#       description = "Bypass cache for admin"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# COMMON EXPRESSIONS REFERENCE
# =============================================================================
#
# Redirect Examples:
#   http.host eq "www.example.com"
#   http.request.uri.path eq "/old-page"
#   http.request.uri.path matches "^/blog/"
#
# Rewrite Examples:
#   ends_with(http.request.uri.path, "/")
#   http.request.uri.path ne lower(http.request.uri.path)
#
# Config Rule Examples:
#   http.request.uri.path matches "^/admin"
#   http.request.uri.path.extension in {"css" "js" "png"}
