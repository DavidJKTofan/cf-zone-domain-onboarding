# Cloudflare Application Services - Security Configuration (Provider v5)
# Security headers and additional protections
#
# IMPORTANT v5 CHANGES:
# - cloudflare_managed_headers → cloudflare_managed_transforms
# - Block syntax changed to list of objects syntax

# =============================================================================
# MANAGED TRANSFORMS (Recommended)
# v5: Renamed from cloudflare_managed_headers to cloudflare_managed_transforms
# v5: Blocks changed to list of objects syntax
# =============================================================================

resource "cloudflare_managed_transforms" "main" {
  zone_id = data.cloudflare_zone.main.zone_id

  # v5: managed_request_headers is now a list of objects
  managed_request_headers = [
    {
      id      = "add_true_client_ip_headers"
      enabled = true
    },
    {
      id      = "add_visitor_location_headers"
      enabled = true
    }
  ]

  # v5: managed_response_headers is now a list of objects
  managed_response_headers = [
    {
      id      = "remove_x-powered-by_header"
      enabled = true
    },
    {
      id      = "add_security_headers"
      enabled = true
    }
  ]
}

# =============================================================================
# CUSTOM SECURITY HEADERS (Examples - uncomment and customize)
# =============================================================================

# resource "cloudflare_ruleset" "security_headers" {
#   zone_id     = data.cloudflare_zone.main.zone_id
#   name        = "Security Headers"
#   description = "Add security headers to responses"
#   kind        = "zone"
#   phase       = "http_response_headers_transform"
#
#   # v5: rules as list of objects, headers as map keyed by header name
#   rules = [
#     {
#       action = "rewrite"
#       action_parameters = {
#         headers = {
#           "X-Frame-Options" = {
#             operation = "set"
#             value     = "SAMEORIGIN"
#           }
#         }
#       }
#       expression  = "true"
#       description = "Set X-Frame-Options"
#       enabled     = true
#     },
#     {
#       action = "rewrite"
#       action_parameters = {
#         headers = {
#           "Content-Security-Policy" = {
#             operation = "set"
#             value     = "default-src 'self'; script-src 'self' 'unsafe-inline'"
#           }
#         }
#       }
#       expression  = "true"
#       description = "Set CSP header"
#       enabled     = true
#     },
#     {
#       action = "rewrite"
#       action_parameters = {
#         headers = {
#           "Server" = {
#             operation = "remove"
#           }
#         }
#       }
#       expression  = "true"
#       description = "Remove Server header"
#       enabled     = true
#     }
#   ]
# }

# =============================================================================
# SECURITY HEADER REFERENCE
# =============================================================================
#
# X-Frame-Options:
#   DENY - Cannot be displayed in iframe
#   SAMEORIGIN - Only same origin iframes
#
# X-Content-Type-Options:
#   nosniff - Prevents MIME type sniffing
#
# Referrer-Policy:
#   strict-origin-when-cross-origin (RECOMMENDED)
#   no-referrer - Never send referrer
#
# Content-Security-Policy (CSP):
#   default-src 'self'; script-src 'self' cdn.example.com;
#   Start with report-only mode for testing
#
# Permissions-Policy:
#   geolocation=(), camera=(), microphone=()

# =============================================================================
# SECURITY BEST PRACTICES
# =============================================================================
#
# 1. Enable HSTS after confirming HTTPS works everywhere
# 2. Use CSP to prevent XSS attacks
# 3. Set X-Frame-Options to prevent clickjacking
# 4. Remove server info headers (Server, X-Powered-By)
# 5. Use strict SSL/TLS mode
# 6. Enable Authenticated Origin Pulls for origin security
# 7. Monitor Security Events dashboard
# 8. Regular security audits of rules
