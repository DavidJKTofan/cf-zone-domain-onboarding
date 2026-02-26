# Cloudflare for SaaS - Input Variables
# https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/

# =============================================================================
# Authentication
# =============================================================================

variable "cloudflare_api_token" {
  description = "Cloudflare API token with 'SSL and Certificates Edit' permission"
  type        = string
  sensitive   = true
}

# =============================================================================
# Zone Configuration
# =============================================================================

variable "zone_id" {
  description = "Cloudflare Zone ID for your SaaS domain"
  type        = string
}

variable "fallback_subdomain" {
  description = "Subdomain for the fallback origin (e.g., 'fallback' for fallback.example.com)"
  type        = string
  default     = "fallback"
}

variable "fallback_origin_address" {
  description = "IP address or hostname of your origin server"
  type        = string
}

variable "cname_target_subdomain" {
  description = "Subdomain for the CNAME target (e.g., 'customers' for *.customers.example.com)"
  type        = string
  default     = "customers"
}

# =============================================================================
# Custom Hostnames
# =============================================================================

variable "custom_hostnames" {
  description = "Map of custom hostnames to create. Key is a unique identifier."
  type = map(object({
    hostname = string # Customer's vanity domain (e.g., saas.customer.com)

    # SSL/TLS Configuration
    ssl_method            = optional(string, "txt")        # Validation method: txt, http, email
    ssl_type              = optional(string, "dv")         # Certificate type: dv (domain validated)
    certificate_authority = optional(string, "google")     # CA: google, lets_encrypt, or empty for default
    min_tls_version       = optional(string, "1.2")        # Minimum TLS: 1.0, 1.1, 1.2, 1.3
    wildcard              = optional(bool, false)          # Enable wildcard certificate
    bundle_method         = optional(string, "ubiquitous") # Bundle method: ubiquitous, optimal, force

    # Custom Origin (optional - overrides fallback origin)
    custom_origin_server = optional(string, null) # Custom origin hostname
    custom_origin_sni    = optional(string, null) # Custom SNI for origin

    # Custom Metadata (optional - accessible in Workers/WAF rules)
    # Note: Terraform only supports string keys and values for custom_metadata
    custom_metadata = optional(map(string), {})

    # Wait for active status before completing
    wait_for_ssl_pending_validation = optional(bool, false)
  }))
  default = {}
}

# =============================================================================
# Default SSL Settings
# =============================================================================

variable "default_ssl_method" {
  description = "Default SSL validation method for custom hostnames"
  type        = string
  default     = "txt"

  validation {
    condition     = contains(["txt", "http", "email"], var.default_ssl_method)
    error_message = "SSL method must be one of: txt, http, email"
  }
}

variable "default_certificate_authority" {
  description = "Default Certificate Authority (google, lets_encrypt, or empty for default)"
  type        = string
  default     = "google"

  validation {
    condition     = contains(["google", "lets_encrypt", ""], var.default_certificate_authority)
    error_message = "Certificate authority must be: google, lets_encrypt, or empty string"
  }
}

variable "default_min_tls_version" {
  description = "Default minimum TLS version for custom hostnames"
  type        = string
  default     = "1.2"

  validation {
    condition     = contains(["1.0", "1.1", "1.2", "1.3"], var.default_min_tls_version)
    error_message = "Minimum TLS version must be one of: 1.0, 1.1, 1.2, 1.3"
  }
}

# =============================================================================
# Advanced Settings
# =============================================================================

variable "enable_cname_target_dns" {
  description = "Create the wildcard CNAME record for CNAME target"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to resources (for organization)"
  type        = map(string)
  default     = {}
}
