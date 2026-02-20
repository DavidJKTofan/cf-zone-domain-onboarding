# Cloudflare Application Services - SSL/TLS Configuration (Provider v5)
# Certificate and encryption settings
#
# Note: Core SSL/TLS settings are in main.tf via cloudflare_zone_setting resources

# =============================================================================
# SSL/TLS NOTES
# =============================================================================
#
# SSL Modes:
# - off: No encryption (NOT RECOMMENDED)
# - flexible: Browser-to-Cloudflare only (NOT RECOMMENDED)
# - full: End-to-end, but doesn't validate origin cert
# - strict: End-to-end with origin cert validation (RECOMMENDED)
#
# For "strict" mode, origin needs either:
# 1. Valid public certificate (Let's Encrypt, etc.)
# 2. Cloudflare Origin CA certificate
#
# Minimum TLS Version:
# - 1.2: Good security + compatibility (RECOMMENDED)
# - 1.3: Maximum security, modern browsers

# =============================================================================
# ADVANCED CERTIFICATE (Optional)
# Uncomment to order an Advanced Certificate
# Note: v5 changes include nested attribute syntax changes
# =============================================================================

# resource "cloudflare_certificate_pack" "advanced" {
#   zone_id               = data.cloudflare_zone.main.zone_id
#   type                  = "advanced"
#   hosts                 = [var.domain, "*.${var.domain}"]
#   validation_method     = "txt"
#   validity_days         = 90
#   certificate_authority = "lets_encrypt"
# }

# =============================================================================
# ORIGIN CA CERTIFICATE (Optional)
# Uncomment to create an Origin CA certificate for your origin server
# =============================================================================

# resource "cloudflare_origin_ca_certificate" "main" {
#   hostnames          = [var.domain, "*.${var.domain}"]
#   request_type       = "origin-rsa"
#   requested_validity = 5475  # 15 years
#   
#   # Provide your CSR, or omit to let Cloudflare generate
#   # csr = file("origin.csr")
# }

# =============================================================================
# AUTHENTICATED ORIGIN PULLS (mTLS)
# Uncomment to enable mTLS between Cloudflare and your origin
# =============================================================================

# resource "cloudflare_authenticated_origin_pulls" "main" {
#   zone_id = data.cloudflare_zone.main.zone_id
#   enabled = true
# }

# =============================================================================
# HOSTNAME TLS SETTING (Per-hostname settings)
# v5: 'setting' is now 'setting_id'
# =============================================================================

# resource "cloudflare_hostname_tls_setting" "example" {
#   zone_id    = data.cloudflare_zone.main.zone_id
#   hostname   = "secure.${var.domain}"
#   setting_id = "min_tls_version"  # v5: renamed from 'setting'
#   value      = "1.3"
# }
