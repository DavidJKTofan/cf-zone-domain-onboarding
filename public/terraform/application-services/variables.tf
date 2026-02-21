# Cloudflare Application Services - Variables (Provider v5)
# Input variables for configuring Cloudflare resources
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
  description = "SSL/TLS encryption mode: off, flexible, full, strict"
  type        = string
  default     = "full"

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
