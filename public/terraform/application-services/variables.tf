# Cloudflare Application Services - Variables (Provider v5.17+)
# Enterprise-Optimized Configuration
#
# Input variables for configuring Cloudflare resources with Enterprise best practices.
#
# Authentication Best Practice:
# Use the CLOUDFLARE_API_TOKEN environment variable for authentication.
# DO NOT store API tokens in terraform.tfvars or any committed files.
# See: https://developers.cloudflare.com/terraform/advanced-topics/best-practices/
#
# Required API Token Permissions:
# - Zone:Zone:Read
# - Zone:DNS:Edit
# - Zone:WAF:Edit
# - Zone:Zone Settings:Edit
# - Zone:SSL and Certificates:Edit
#
# ENTERPRISE DEFAULTS:
# - SSL Mode: "strict" (validates origin certificate)
# - 0-RTT: disabled (replay attack protection)
# - Always Online: disabled (branded error pages preferred)
# - Automatic HTTPS Rewrites: disabled (fix at source)
# - Minify: REMOVED in v5.17+ (use CI/CD pipeline)

# =============================================================================
# REQUIRED VARIABLES
# =============================================================================

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID (find at: dash.cloudflare.com)"
  type        = string
}

variable "domain" {
  description = "The domain name to manage (e.g., example.com)"
  type        = string
}

# =============================================================================
# SSL/TLS SETTINGS
# =============================================================================

variable "ssl_mode" {
  description = "SSL/TLS encryption mode: off, flexible, full, strict. Enterprise default: strict"
  type        = string
  default     = "strict" # Enterprise: Always use strict for origin cert validation

  validation {
    condition     = contains(["off", "flexible", "full", "strict"], var.ssl_mode)
    error_message = "SSL mode must be: off, flexible, full, or strict."
  }
}

variable "min_tls_version" {
  description = "Minimum TLS version: 1.0, 1.1, 1.2, 1.3"
  type        = string
  default     = "1.2"
}

# =============================================================================
# SECURITY SETTINGS
# =============================================================================

variable "security_level" {
  description = "Security level: off, essentially_off, low, medium, high, under_attack"
  type        = string
  default     = "medium"
}

# =============================================================================
# CACHE SETTINGS
# =============================================================================

variable "browser_cache_ttl" {
  description = "Browser cache TTL in seconds (0 = respect origin)"
  type        = number
  default     = 14400
}

# =============================================================================
# DNS RECORDS
# Note: In v5, cloudflare_record is renamed to cloudflare_dns_record
# and 'name' must be the full FQDN
# =============================================================================

variable "dns_records" {
  description = "List of DNS records to create"
  type = list(object({
    name    = string # Must be full FQDN in v5 (e.g., "www.example.com" not "www")
    type    = string
    content = string # v5 uses 'content' instead of 'value'
    ttl     = optional(number, 1)
    proxied = optional(bool, true)
    comment = optional(string, "")
  }))
  default = []
}

variable "mx_records" {
  description = "List of MX records for email"
  type = list(object({
    name     = string # Full FQDN
    content  = string # v5 uses 'content'
    priority = number
    ttl      = optional(number, 300)
    comment  = optional(string, "")
  }))
  default = []
}

variable "txt_records" {
  description = "List of TXT records"
  type = list(object({
    name    = string # Full FQDN
    content = string # v5 uses 'content'
    ttl     = optional(number, 300)
    comment = optional(string, "")
  }))
  default = []
}

# =============================================================================
# WAF SETTINGS
# =============================================================================

variable "enable_managed_waf" {
  description = "Enable Cloudflare Managed WAF ruleset"
  type        = bool
  default     = true
}

variable "enable_owasp_ruleset" {
  description = "Enable OWASP Core Ruleset"
  type        = bool
  default     = true
}

# =============================================================================
# OPTIONAL FEATURES
# =============================================================================

variable "enable_tiered_cache" {
  description = "Enable Tiered Cache for improved cache hit rates"
  type        = bool
  default     = true
}

variable "notification_email" {
  description = "Email for notifications (optional)"
  type        = string
  default     = ""
}

# =============================================================================
# ENTERPRISE SECURITY SETTINGS
# =============================================================================

variable "enable_0rtt" {
  description = "Enable 0-RTT (Zero Round Trip Time Resumption). SECURITY WARNING: Vulnerable to replay attacks. Must be OFF for banks, SaaS, login sites. Only safe for static content."
  type        = bool
  default     = false # Enterprise default: OFF for security
}

variable "enable_always_online" {
  description = "Enable Always Online (serves cached pages from Internet Archive if origin is down). Enterprise recommendation: OFF - branded error pages are preferred over archived content."
  type        = bool
  default     = false # Enterprise default: OFF for brand safety
}

variable "automatic_https_rewrites" {
  description = "Enable Automatic HTTPS Rewrites (rewrites http links to https). Enterprise recommendation: OFF - fix mixed content at source/CMS rather than relying on edge rewriting."
  type        = bool
  default     = false # Enterprise default: OFF - fix at source
}

# =============================================================================
# ENTERPRISE PERFORMANCE SETTINGS
# =============================================================================

variable "enable_origin_error_page_pass_thru" {
  description = "Enable Origin Error Page Pass-Through. Shows your branded error pages instead of generic Cloudflare errors. WARNING: Ensure error pages don't leak stack traces."
  type        = bool
  default     = true # Enterprise default: ON for branding
}

variable "enable_sort_query_string" {
  description = "Enable Sort Query String for Cache. Huge cache hit ratio win - treats disordered query params as same cache object. Only disable if app logic depends on parameter order."
  type        = bool
  default     = true # Enterprise default: ON for cache efficiency
}

variable "enable_h2_prioritization" {
  description = "Enable HTTP/2 Prioritization. Optimizes resource delivery order, improving Time to Interactive by sending CSS/JS before images."
  type        = bool
  default     = true # Enterprise default: ON for performance
}
