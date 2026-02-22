# Cloudflare Application Services - Outputs (Provider v5)
# Output values for reference and integration

# =============================================================================
# ZONE INFORMATION
# =============================================================================

output "zone_id" {
  description = "The Zone ID"
  value       = data.cloudflare_zone.main.zone_id
}

output "zone_name" {
  description = "The Zone name (domain)"
  value       = data.cloudflare_zone.main.name
}

output "zone_status" {
  description = "The Zone status"
  value       = data.cloudflare_zone.main.status
}

output "zone_name_servers" {
  description = "Cloudflare nameservers for this zone"
  value       = data.cloudflare_zone.main.name_servers
}

# =============================================================================
# DNS RECORDS
# =============================================================================

output "dns_records" {
  description = "Created DNS records"
  value = {
    for key, record in cloudflare_dns_record.main :
    key => {
      id      = record.id
      name    = record.name
      type    = record.type
      content = record.content
      proxied = record.proxied
    }
  }
}

output "mx_records" {
  description = "Created MX records"
  value = {
    for key, record in cloudflare_dns_record.mx :
    key => {
      id       = record.id
      name     = record.name
      priority = record.priority
      content  = record.content
    }
  }
}

output "txt_records" {
  description = "Created TXT records"
  value = {
    for key, record in cloudflare_dns_record.txt :
    key => {
      id      = record.id
      name    = record.name
      content = record.content
    }
  }
}

# =============================================================================
# CONFIGURATION SUMMARY
# =============================================================================

output "configuration_summary" {
  description = "Summary of the Cloudflare configuration"
  value = {
    domain          = var.domain
    zone_id         = data.cloudflare_zone.main.zone_id
    ssl_mode        = var.ssl_mode
    min_tls_version = var.min_tls_version
    security_level  = var.security_level
    waf_enabled     = var.enable_managed_waf
    owasp_enabled   = var.enable_owasp_ruleset
  }
}

output "enterprise_settings_summary" {
  description = "Summary of Enterprise-specific security and performance settings"
  value = {
    zero_rtt_enabled            = var.enable_0rtt
    always_online_enabled       = var.enable_always_online
    automatic_https_rewrites    = var.automatic_https_rewrites
    origin_error_page_pass_thru = var.enable_origin_error_page_pass_thru
    sort_query_string_for_cache = var.enable_sort_query_string
    h2_prioritization           = var.enable_h2_prioritization
    # Note: minify setting removed in Terraform Provider v5.17+
  }
}
