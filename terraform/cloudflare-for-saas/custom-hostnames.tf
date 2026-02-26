# Cloudflare for SaaS - Custom Hostnames Configuration
# https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/create-custom-hostnames/
#
# Custom hostnames allow your customers to use their own vanity domains
# while benefiting from Cloudflare's security and performance features.
#
# Traffic flow:
# saas.customer.com -> customer1.customers.example.com -> fallback.example.com -> Origin

# =============================================================================
# Custom Hostnames
# =============================================================================

resource "cloudflare_custom_hostname" "hostnames" {
  for_each = var.custom_hostnames

  zone_id  = var.zone_id
  hostname = each.value.hostname

  # SSL/TLS Configuration (v4 provider syntax)
  ssl {
    method                = coalesce(each.value.ssl_method, var.default_ssl_method)
    type                  = each.value.ssl_type
    certificate_authority = coalesce(each.value.certificate_authority, var.default_certificate_authority)
    wildcard              = each.value.wildcard
    bundle_method         = each.value.bundle_method

    settings {
      min_tls_version = coalesce(each.value.min_tls_version, var.default_min_tls_version)
    }
  }

  # Custom Origin Server (optional)
  # Overrides the fallback origin for this specific hostname
  custom_origin_server = each.value.custom_origin_server
  custom_origin_sni    = each.value.custom_origin_sni

  # Custom Metadata (optional)
  # Accessible via:
  # - Workers: request.cf.hostMetadata
  # - WAF Rules: cf.hostname.metadata
  # Note: Terraform only supports string keys and values
  custom_metadata = length(each.value.custom_metadata) > 0 ? each.value.custom_metadata : null

  # Ensure fallback origin is created first
  depends_on = [cloudflare_custom_hostname_fallback_origin.fallback]

  lifecycle {
    # Prevent accidental deletion of production hostnames
    prevent_destroy = false # Set to true in production
  }
}

# =============================================================================
# Example: Custom Hostnames with Custom Origins
# =============================================================================

# Uncomment and modify to create hostnames with dedicated origins
# This routes premium customers to dedicated infrastructure

# resource "cloudflare_record" "premium_origin" {
#   zone_id = var.zone_id
#   name    = "premium-origin"
#   type    = "A"
#   value   = "203.0.113.50"  # Premium tier origin IP
#   proxied = true
#   ttl     = 1
#   comment = "Dedicated origin for premium customers"
# }

# resource "cloudflare_custom_hostname" "premium_customer" {
#   zone_id  = var.zone_id
#   hostname = "app.premium-customer.com"
#
#   ssl {
#     method                = "txt"
#     type                  = "dv"
#     certificate_authority = "google"
#     settings {
#       min_tls_version = "1.2"
#     }
#   }
#
#   custom_origin_server = "premium-origin.${local.zone_name}"
#
#   custom_metadata = {
#     tier           = "premium"
#     customer_id    = "cust_12345"
#     security_level = "high"
#   }
#
#   depends_on = [
#     cloudflare_custom_hostname_fallback_origin.fallback,
#     cloudflare_record.premium_origin
#   ]
# }
