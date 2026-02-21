# Cloudflare Application Services - Cache Configuration (Provider v5)
# Caching rules and settings
#
# IMPORTANT v5 CHANGES:
# - cloudflare_tiered_cache: 'cache_type' is now 'value'
# - Ruleset syntax changes (blocks → nested attributes)

# =============================================================================
# TIERED CACHE
# v5: cache_type → value, accepts "on" or "off" string
# =============================================================================

resource "cloudflare_tiered_cache" "main" {
  count = var.enable_tiered_cache ? 1 : 0

  zone_id = data.cloudflare_zone.main.zone_id
  value   = "on" # v5: accepts "on" or "off" (not boolean)
}

# Note: For Smart Tiered Cache (Enterprise), use value = "smart"

# =============================================================================
# CACHE RULES (Examples - uncomment and customize)
# =============================================================================

# resource "cloudflare_ruleset" "cache" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Cache Rules"
#   description = "Custom cache rules"
#   kind        = "zone"
#   phase       = "http_request_cache_settings"
#
#   # v5: rules as list of objects
#   rules = [
#     {
#       action = "set_cache_settings"
#       action_parameters = {
#         cache = true
#         edge_ttl = {
#           mode    = "override_origin"
#           default = 2592000  # 30 days
#         }
#         browser_ttl = {
#           mode    = "override_origin"
#           default = 86400    # 1 day
#         }
#       }
#       expression  = "http.request.uri.path.extension in {\"css\" \"js\" \"jpg\" \"jpeg\" \"png\" \"gif\" \"ico\" \"svg\" \"woff\" \"woff2\"}"
#       description = "Cache static assets"
#       enabled     = true
#     },
#     {
#       action = "set_cache_settings"
#       action_parameters = {
#         cache = false
#       }
#       expression  = "http.request.uri.path matches \"^/api/\""
#       description = "Bypass cache for API"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# CACHE RESERVE (Enterprise feature)
# v5: 'enabled' is now 'value' with "on"/"off" string
# =============================================================================

# resource "cloudflare_zone_cache_reserve" "main" {
#   zone_id = data.cloudflare_zone.main.zone_id
#   value   = "on"  # v5: 'enabled = true' is now 'value = "on"'
# }

# =============================================================================
# CACHING BEST PRACTICES
# =============================================================================
#
# Cache-Control Header Recommendations:
#
# Static assets (CSS, JS, images):
#   Cache-Control: public, max-age=31536000, immutable
#   Use versioned filenames (style.abc123.css)
#
# HTML pages:
#   Cache-Control: public, max-age=0, must-revalidate
#
# API responses:
#   Cache-Control: no-store
#
# User-specific content:
#   Cache-Control: private, no-store
#
# TTL Recommendations:
# - Static assets: 30 days edge, 1 day browser
# - HTML: Short TTL or must-revalidate
# - API: No cache
# - Admin/auth pages: No cache
