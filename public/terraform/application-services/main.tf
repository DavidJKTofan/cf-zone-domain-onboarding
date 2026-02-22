# Cloudflare Application Services - Main Configuration (Provider v5)
# Enterprise-Optimized Configuration
#
# This configuration aligns with the Zero-Downtime Domain Migration Guide
# and implements Cloudflare Enterprise Best Practices.
#
# IMPORTANT: This uses Cloudflare Terraform Provider v5 (v5.17.0+)
# v5 has breaking changes from v4 - see migration guide:
# https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/guides/version-5-upgrade
#
# DEPRECATION NOTES (v5.17+):
# - 'minify' setting has been REMOVED - use CI/CD pipeline minification instead
# - 'mirage' is deprecated - use Polish or Image Resizing instead
#
# Usage:
#   1. Copy terraform.tfvars.example to terraform.tfvars
#   2. Fill in your values (add terraform.tfvars to .gitignore!)
#   3. Set CLOUDFLARE_API_TOKEN environment variable (recommended)
#   4. Run: terraform init && terraform plan && terraform apply
#
# Enterprise Best Practices:
# - Use API tokens (not global API key) with minimal required permissions
# - Store credentials in environment variables, not in config files
# - Use remote state backend for team collaboration
# - Manage resources in Terraform only - avoid dashboard/API changes
# - Use locals for reusable values (ruleset IDs, etc.)
# - SSL Mode: Always use "strict" for end-to-end encryption validation
# - 0-RTT: Disable for security-sensitive sites (replay attack risk)
# - Always Online: Disable for Enterprise (branded error pages preferred)

terraform {
  required_version = ">= 1.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 5.17" # Use v5.17+ - minify setting removed, zone_setting stabilized
    }
  }

  # Uncomment for remote state (recommended for teams)
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "cloudflare/application-services/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

# Configure the Cloudflare Provider
# Authentication options (in order of preference):
# 1. CLOUDFLARE_API_TOKEN environment variable (RECOMMENDED)
# 2. api_token in provider block (not recommended - use for local dev only)
#
# Create API token at: https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Zone:Zone:Read, Zone:DNS:Edit, Zone:WAF:Edit,
#                       Zone:Zone Settings:Edit, Zone:SSL and Certificates:Edit
provider "cloudflare" {
  # api_token is read from CLOUDFLARE_API_TOKEN environment variable
  # Uncomment below only for local development (never commit with token!)
  # api_token = var.cloudflare_api_token
}

# =============================================================================
# LOCAL VALUES
# Best practice: Use locals for reusable values like managed ruleset IDs
# =============================================================================

locals {
  # Cloudflare Managed Ruleset IDs (these are global constants)
  managed_ruleset_id     = "efb7b8c949ac4650a09736fc376e9aee" # Cloudflare Managed Ruleset
  owasp_ruleset_id       = "4814384a9e5d4991b9815dcfc25d2f1f" # OWASP Core Ruleset
  owasp_anomaly_score_id = "6179ae15870a4bb7b2d480d4843b323c" # OWASP Anomaly Score rule
}

# =============================================================================
# DATA SOURCES
# =============================================================================

# Get zone details (zone must already exist in Cloudflare)
data "cloudflare_zone" "main" {
  filter = {
    name = var.domain
  }
}

# =============================================================================
# ZONE SETTINGS (v5: Individual cloudflare_zone_setting resources)
# Note: cloudflare_zone_settings_override was REMOVED in v5
# =============================================================================

# SSL/TLS Mode
resource "cloudflare_zone_setting" "ssl" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "ssl"
  value      = var.ssl_mode
}

# Minimum TLS Version
resource "cloudflare_zone_setting" "min_tls_version" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "min_tls_version"
  value      = var.min_tls_version
}

# TLS 1.3
resource "cloudflare_zone_setting" "tls_1_3" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "tls_1_3"
  value      = "on"
}

# Always Use HTTPS
resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

# Automatic HTTPS Rewrites
# Enterprise Note: OFF is recommended - better to fix mixed content at source/CMS
# than rely on edge rewriting. Can hide bad coding practices.
resource "cloudflare_zone_setting" "automatic_https_rewrites" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "automatic_https_rewrites"
  value      = var.automatic_https_rewrites ? "on" : "off"
}

# Security Level
resource "cloudflare_zone_setting" "security_level" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "security_level"
  value      = var.security_level
}

# Browser Check
resource "cloudflare_zone_setting" "browser_check" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "browser_check"
  value      = "on"
}

# Brotli Compression
resource "cloudflare_zone_setting" "brotli" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "brotli"
  value      = "on"
}

# Early Hints
resource "cloudflare_zone_setting" "early_hints" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "early_hints"
  value      = "on"
}

# HTTP/3
resource "cloudflare_zone_setting" "http3" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "http3"
  value      = "on"
}

# 0-RTT (Zero Round Trip Time Resumption)
# ENTERPRISE SECURITY WARNING: 0-RTT is vulnerable to REPLAY ATTACKS
# Must be OFF for banks, SaaS, login sites, or any security-sensitive applications
# Only safe for static content sites (blogs, media)
resource "cloudflare_zone_setting" "zero_rtt" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "0rtt"
  value      = var.enable_0rtt ? "on" : "off"
}

# WebSockets
resource "cloudflare_zone_setting" "websockets" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "websockets"
  value      = "on"
}

# Browser Cache TTL
resource "cloudflare_zone_setting" "browser_cache_ttl" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "browser_cache_ttl"
  value      = var.browser_cache_ttl
}

# Always Online
# ENTERPRISE BEST PRACTICE: OFF - A broken/archived site from Internet Archive
# looks worse than a clean branded maintenance page for Enterprise brands.
# Only enable for news/content sites that must stay up at all costs.
resource "cloudflare_zone_setting" "always_online" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "always_online"
  value      = var.enable_always_online ? "on" : "off"
}

# Email Obfuscation
resource "cloudflare_zone_setting" "email_obfuscation" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "email_obfuscation"
  value      = "on"
}

# IP Geolocation
resource "cloudflare_zone_setting" "ip_geolocation" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "ip_geolocation"
  value      = "on"
}

# Opportunistic Onion
resource "cloudflare_zone_setting" "opportunistic_onion" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "opportunistic_onion"
  value      = "on"
}

# =============================================================================
# MINIFY SETTING - REMOVED IN TERRAFORM PROVIDER v5.17+
# =============================================================================
# The minify setting has been DEPRECATED by Cloudflare (as of 2024-08-05)
# and REMOVED from the Terraform Provider v5.17+.
#
# ENTERPRISE BEST PRACTICE: Let your CI/CD pipeline handle minification.
# Cloudflare modifying code breaks Subresource Integrity (SRI) hashes.
#
# Reference: https://developers.cloudflare.com/fundamentals/api/reference/deprecations/#2024-08-05
# =============================================================================

# =============================================================================
# ENTERPRISE-SPECIFIC SETTINGS
# =============================================================================

# Origin Error Page Pass-Through (Enterprise)
# Shows your branded error pages instead of generic Cloudflare errors
# WARNING: Ensure your error pages don't leak stack traces!
resource "cloudflare_zone_setting" "origin_error_page_pass_thru" {
  count = var.enable_origin_error_page_pass_thru ? 1 : 0

  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "origin_error_page_pass_thru"
  value      = "on"
}

# Sort Query String for Cache (Enterprise Performance)
# Huge cache hit ratio win - treats ?b=1&a=2 same as ?a=2&b=1
# Only disable if app logic explicitly depends on parameter order (rare)
resource "cloudflare_zone_setting" "sort_query_string" {
  count = var.enable_sort_query_string ? 1 : 0

  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "sort_query_string_for_cache"
  value      = "on"
}

# HTTP/2 (Enterprise Performance)
# Essential for modern performance - multiplexing support
resource "cloudflare_zone_setting" "http2" {
  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "http2"
  value      = "on"
}

# H2 Prioritization (Enterprise Performance)
# Optimizes resource delivery order over HTTP/2
# Improves Time to Interactive by sending CSS/JS before images
resource "cloudflare_zone_setting" "h2_prioritization" {
  count = var.enable_h2_prioritization ? 1 : 0

  zone_id    = data.cloudflare_zone.main.zone_id
  setting_id = "h2_prioritization"
  value      = "on"
}
