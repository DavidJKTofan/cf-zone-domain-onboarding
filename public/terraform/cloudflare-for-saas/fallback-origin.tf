# Cloudflare for SaaS - Fallback Origin Configuration
# https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/#1-create-fallback-origin
#
# The fallback origin is where Cloudflare routes traffic sent to custom hostnames.
# Requirements:
# - Must be a proxied (orange cloud) DNS record
# - Cannot be the zone apex (root domain)
# - Can be an A, AAAA, or CNAME record

# =============================================================================
# Fallback Origin DNS Record
# =============================================================================

# Create the DNS record for the fallback origin
# This record points to your actual origin server
resource "cloudflare_record" "fallback_origin" {
  zone_id = var.zone_id
  name    = var.fallback_subdomain
  type    = can(regex("^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$", var.fallback_origin_address)) ? "A" : "CNAME"
  value   = var.fallback_origin_address
  proxied = true # Must be proxied for custom hostnames
  ttl     = 1    # Auto TTL when proxied
  comment = "Fallback origin for Cloudflare for SaaS custom hostnames"
}

# =============================================================================
# Fallback Origin Designation
# =============================================================================

# Designate the DNS record as the fallback origin for custom hostnames
# API: PUT /zones/{zone_id}/custom_hostnames/fallback_origin
resource "cloudflare_custom_hostname_fallback_origin" "fallback" {
  zone_id = var.zone_id
  origin  = local.fallback_hostname

  depends_on = [cloudflare_record.fallback_origin]
}

# =============================================================================
# CNAME Target (Optional but Recommended)
# =============================================================================

# Create a wildcard CNAME record for the CNAME target
# This allows customers to point to: customer1.customers.example.com
# Which matches: *.customers.example.com -> fallback.example.com
resource "cloudflare_record" "cname_target" {
  count = var.enable_cname_target_dns ? 1 : 0

  zone_id = var.zone_id
  name    = "*.${var.cname_target_subdomain}"
  type    = "CNAME"
  value   = local.fallback_hostname
  proxied = true
  ttl     = 1
  comment = "Wildcard CNAME target for customer DNS delegation"

  depends_on = [cloudflare_record.fallback_origin]
}

# Also create the non-wildcard version for direct access
resource "cloudflare_record" "cname_target_base" {
  count = var.enable_cname_target_dns ? 1 : 0

  zone_id = var.zone_id
  name    = var.cname_target_subdomain
  type    = "CNAME"
  value   = local.fallback_hostname
  proxied = true
  ttl     = 1
  comment = "Base CNAME target record"

  depends_on = [cloudflare_record.fallback_origin]
}
