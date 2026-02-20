# Cloudflare Application Services - DNS Configuration (Provider v5)
# DNS records management
#
# IMPORTANT v5 CHANGES:
# - Resource renamed from cloudflare_record to cloudflare_dns_record
# - 'value' attribute renamed to 'content'
# - 'name' must be the full FQDN (e.g., "www.example.com" not just "www")
# - 'data' block is now a single nested attribute

# =============================================================================
# STANDARD DNS RECORDS (A, AAAA, CNAME)
# =============================================================================

resource "cloudflare_dns_record" "main" {
  for_each = {
    for idx, record in var.dns_records :
    "${record.name}_${record.type}_${idx}" => record
  }

  zone_id = data.cloudflare_zone.main.zone_id
  name    = each.value.name # Must be full FQDN in v5
  type    = each.value.type
  content = each.value.content # v5: 'value' renamed to 'content'
  ttl     = each.value.proxied ? 1 : each.value.ttl
  proxied = each.value.proxied
  comment = each.value.comment
}

# =============================================================================
# MX RECORDS (Email)
# =============================================================================

resource "cloudflare_dns_record" "mx" {
  for_each = {
    for idx, record in var.mx_records :
    "${record.name}_mx_${record.priority}_${idx}" => record
  }

  zone_id  = data.cloudflare_zone.main.zone_id
  name     = each.value.name # Full FQDN
  type     = "MX"
  content  = each.value.content # v5: 'value' renamed to 'content'
  priority = each.value.priority
  ttl      = each.value.ttl
  proxied  = false # MX records cannot be proxied
  comment  = each.value.comment
}

# =============================================================================
# TXT RECORDS (SPF, DKIM, DMARC, verification)
# =============================================================================

resource "cloudflare_dns_record" "txt" {
  for_each = {
    for idx, record in var.txt_records :
    "${record.name}_txt_${idx}" => record
  }

  zone_id = data.cloudflare_zone.main.zone_id
  name    = each.value.name # Full FQDN
  type    = "TXT"
  content = each.value.content # v5: 'value' renamed to 'content'
  ttl     = each.value.ttl
  proxied = false # TXT records cannot be proxied
  comment = each.value.comment
}

# =============================================================================
# NOTES
# =============================================================================
#
# v5 Migration Notes for DNS:
# - cloudflare_record → cloudflare_dns_record
# - 'value' → 'content'
# - 'name' must be full FQDN (e.g., "example.com" for root, "www.example.com" for www)
# - 'data' block is now: data = { ... } instead of data { ... }
# - 'hostname' attribute has been removed
# - 'allow_overwrite' attribute has been removed
#
# Proxy Status (proxied = true/false):
# - true (orange cloud): Traffic routes through Cloudflare CDN/WAF
# - false (gray cloud): DNS-only, traffic goes direct to origin
#
# Records that CANNOT be proxied: MX, TXT, SRV, NS
