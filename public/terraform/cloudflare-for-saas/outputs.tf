# Cloudflare for SaaS - Outputs
# https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/

# =============================================================================
# Zone Information
# =============================================================================

output "zone_name" {
  description = "The zone name (domain) for the SaaS configuration"
  value       = local.zone_name
}

output "zone_id" {
  description = "The Cloudflare Zone ID"
  value       = var.zone_id
}

# =============================================================================
# Fallback Origin
# =============================================================================

output "fallback_origin_hostname" {
  description = "The fully qualified hostname of the fallback origin"
  value       = local.fallback_hostname
}

output "fallback_origin_status" {
  description = "Status of the fallback origin designation"
  value       = cloudflare_custom_hostname_fallback_origin.fallback.status
}

# =============================================================================
# CNAME Target
# =============================================================================

output "cname_target_hostname" {
  description = "The CNAME target hostname for customers to point their DNS to"
  value       = local.cname_target_hostname
}

output "cname_target_wildcard" {
  description = "The wildcard CNAME target (e.g., *.customers.example.com)"
  value       = var.enable_cname_target_dns ? "*.${local.cname_target_hostname}" : null
}

output "customer_dns_instructions" {
  description = "Instructions to provide customers for DNS configuration"
  value       = <<-EOT
    Customer DNS Configuration Instructions:
    =========================================
    
    1. Create a CNAME record pointing your domain to our CNAME target:
       
       Type:  CNAME
       Name:  <your-subdomain> (e.g., app, www, api)
       Value: <customer-id>.${local.cname_target_hostname}
       
       Example: app.customer.com -> customer123.${local.cname_target_hostname}
    
    2. If using TXT validation, add the validation record:
       
       Type:  TXT
       Name:  _cf-custom-hostname.<your-hostname>
       Value: <provided-validation-token>
    
    3. For automated certificate renewals (Delegated DCV), add:
       
       Type:  CNAME
       Name:  _acme-challenge.<your-hostname>
       Value: <your-hostname>.dcv.cloudflare.com
  EOT
}

# =============================================================================
# Custom Hostnames
# =============================================================================

output "custom_hostnames" {
  description = "Map of created custom hostnames with their IDs and status"
  value = {
    for key, hostname in cloudflare_custom_hostname.hostnames : key => {
      id       = hostname.id
      hostname = hostname.hostname
      status   = hostname.status
      ssl = {
        status                = hostname.ssl[0].status
        method                = hostname.ssl[0].method
        type                  = hostname.ssl[0].type
        certificate_authority = hostname.ssl[0].certificate_authority
      }
      custom_origin_server = hostname.custom_origin_server
      custom_metadata      = hostname.custom_metadata
    }
  }
}

output "custom_hostname_ids" {
  description = "Map of hostname keys to their Cloudflare IDs (for use in other resources)"
  value = {
    for key, hostname in cloudflare_custom_hostname.hostnames : key => hostname.id
  }
}

output "custom_hostname_validation_records" {
  description = "Validation records for each custom hostname (share with customers)"
  value = {
    for key, hostname in cloudflare_custom_hostname.hostnames : key => {
      hostname = hostname.hostname
      # Note: validation_records may not be immediately available; 
      # use GET API call to retrieve after creation
      ssl_status = hostname.ssl[0].status
      # For TXT validation, customers need to add:
      # TXT record at: _cf-custom-hostname.<hostname>
      # With value from: ssl.validation_records[0].txt_value
    }
  }
  sensitive = false
}

# =============================================================================
# Useful Commands
# =============================================================================

output "helpful_commands" {
  description = "Useful commands for managing custom hostnames"
  value       = <<-EOT
    Useful Commands:
    ================
    
    # List all custom hostnames
    curl -X GET "https://api.cloudflare.com/client/v4/zones/${var.zone_id}/custom_hostnames" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
    
    # Get specific hostname details (replace HOSTNAME_ID)
    curl -X GET "https://api.cloudflare.com/client/v4/zones/${var.zone_id}/custom_hostnames/HOSTNAME_ID" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
    
    # Check fallback origin status
    curl -X GET "https://api.cloudflare.com/client/v4/zones/${var.zone_id}/custom_hostnames/fallback_origin" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
    
    # Verify customer DNS (replace with actual hostname)
    dig +short saas.customer.com CNAME
    curl -sI https://saas.customer.com | grep -i cf-ray
  EOT
}
