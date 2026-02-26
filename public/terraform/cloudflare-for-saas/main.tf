# Cloudflare for SaaS - Terraform Configuration
# https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/
#
# This Terraform configuration manages:
# - Fallback origin for custom hostnames
# - Custom hostnames with SSL/TLS certificates
# - Custom metadata for per-hostname configuration
#
# Terminology:
# - Custom Hostname: Customer's vanity domain (e.g., saas.customer.com)
# - CNAME Target: Wildcard DNS record customers point to (e.g., *.customers.example.com)
# - Fallback Origin: Where Cloudflare routes traffic (e.g., fallback.example.com)
#
# Provider Compatibility:
# - This configuration uses Terraform Provider v4 syntax (stable, widely used)
# - For v5 migration, see: https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/guides/version-5-upgrade

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0" # Use v4.x for stability; upgrade to v5 when ready
    }
  }
}

# Configure the Cloudflare provider
# Authentication via environment variables:
# - CLOUDFLARE_API_TOKEN (recommended)
# - Or CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Data source to fetch zone details
data "cloudflare_zone" "saas_zone" {
  zone_id = var.zone_id
}

# Locals for computed values
locals {
  zone_name = data.cloudflare_zone.saas_zone.name

  # Build full hostnames from variables
  fallback_hostname     = "${var.fallback_subdomain}.${local.zone_name}"
  cname_target_hostname = "${var.cname_target_subdomain}.${local.zone_name}"
}
