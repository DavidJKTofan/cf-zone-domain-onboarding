# Cloudflare for SaaS - Terraform Templates

Terraform configuration for managing Cloudflare for SaaS (Custom Hostnames).

## Overview

This Terraform configuration automates the setup and management of:

- **Fallback Origin**: Where Cloudflare routes custom hostname traffic
- **CNAME Target**: Wildcard DNS record for customer delegation
- **Custom Hostnames**: Customer vanity domains with SSL/TLS certificates
- **Custom Metadata**: Per-hostname configuration for Workers/WAF rules

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Customer DNS                                    │
│    saas.customer.com  ──CNAME──►  customer1.customers.example.com           │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Cloudflare Edge                                    │
│    *.customers.example.com  ──matches──►  fallback.example.com              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Origin Server                                    │
│                           192.0.2.1 (your server)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Cloudflare Account** with an active zone (Enterprise for full features)
2. **API Token** with "SSL and Certificates Edit" permission
3. **Terraform** >= 1.0.0
4. **Cloudflare Provider** ~> 4.0

## Quick Start

```bash
# 1. Clone and navigate
cd terraform/cloudflare-for-saas

# 2. Copy example variables
cp terraform.tfvars.example terraform.tfvars

# 3. Edit with your values
# - Set your API token
# - Set your Zone ID
# - Configure fallback origin
# - Add custom hostnames

# 4. Initialize Terraform
terraform init

# 5. Preview changes
terraform plan

# 6. Apply configuration
terraform apply
```

## Files

| File | Description |
|------|-------------|
| `main.tf` | Provider configuration and data sources |
| `variables.tf` | Input variable definitions |
| `outputs.tf` | Output values (IDs, validation records, instructions) |
| `fallback-origin.tf` | Fallback origin and CNAME target DNS records |
| `custom-hostnames.tf` | Custom hostname resources |
| `terraform.tfvars.example` | Example variable values |

## Configuration

### Required Variables

| Variable | Description |
|----------|-------------|
| `cloudflare_api_token` | API token with SSL/Certificates Edit permission |
| `zone_id` | Cloudflare Zone ID |
| `fallback_origin_address` | IP or hostname of your origin server |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `fallback_subdomain` | `"fallback"` | Subdomain for fallback origin |
| `cname_target_subdomain` | `"customers"` | Subdomain for CNAME target |
| `default_ssl_method` | `"txt"` | Default validation method |
| `default_certificate_authority` | `"google"` | Default CA |
| `default_min_tls_version` | `"1.2"` | Default minimum TLS |

### Custom Hostnames

```hcl
custom_hostnames = {
  "customer-key" = {
    hostname              = "app.customer.com"
    ssl_method            = "txt"           # txt, http, email
    ssl_type              = "dv"            # dv (domain validated)
    certificate_authority = "google"        # google, lets_encrypt
    min_tls_version       = "1.2"           # 1.0, 1.1, 1.2, 1.3
    wildcard              = false           # Enable wildcard cert
    custom_origin_server  = null            # Optional custom origin
    custom_metadata = {
      customer_id = "cust_123"
      plan        = "enterprise"
    }
  }
}
```

## Outputs

After `terraform apply`, you'll receive:

- **Fallback origin hostname and status**
- **CNAME target for customer DNS**
- **Custom hostname IDs and SSL status**
- **Customer DNS instructions**
- **Helpful CLI commands**

## Customer Onboarding Workflow

### 1. Add Customer to Terraform

```hcl
# In terraform.tfvars
custom_hostnames = {
  "new-customer" = {
    hostname = "app.newcustomer.com"
    # ... configuration
  }
}
```

### 2. Apply Changes

```bash
terraform plan
terraform apply
```

### 3. Share Validation Records

```bash
# Get validation records from output
terraform output custom_hostname_validation_records
```

### 4. Customer Adds DNS Records

Customer adds:
1. **TXT record** for validation: `_cf-custom-hostname.app.newcustomer.com`
2. **CNAME record** for traffic: `app.newcustomer.com → newcustomer.customers.example.com`
3. **(Optional) Delegated DCV**: `_acme-challenge.app.newcustomer.com → app.newcustomer.com.dcv.cloudflare.com`

### 5. Verify Status

```bash
# Check hostname status
curl -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/custom_hostnames?hostname=app.newcustomer.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

## Custom Metadata

Custom metadata is accessible in:

- **Workers**: `request.cf.hostMetadata`
- **WAF Rules**: `cf.hostname.metadata["key"]`

Example Worker usage:

```javascript
export default {
  async fetch(request) {
    const metadata = request.cf?.hostMetadata;
    
    if (metadata?.plan === "enterprise") {
      // Enterprise-specific logic
    }
    
    return fetch(request);
  }
}
```

## Troubleshooting

### Hostname stuck in "Pending"

1. Verify customer added TXT validation record
2. Check for CAA records blocking certificate issuance
3. Use API to check validation errors:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/custom_hostnames/$HOSTNAME_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq '.result.ssl.validation_errors'
```

### Fallback origin not active

1. Ensure DNS record is proxied (orange cloud)
2. Verify the record is not on zone apex

### Customer getting SSL errors

1. Verify both Certificate Status and Hostname Status are "Active"
2. Check minimum TLS version compatibility
3. Ensure customer CNAME is pointing to your CNAME target

## Documentation

- [Cloudflare for SaaS Overview](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
- [Custom Hostnames API](https://developers.cloudflare.com/api/resources/custom_hostnames/)
- [Terraform Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)
- [Certificate Validation](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/issue-and-validate/validate-certificates/)

## Security Notes

- **Never commit** `terraform.tfvars` with API tokens to version control
- Add `terraform.tfvars` to `.gitignore`
- Use environment variables for sensitive values in CI/CD
- Consider using Terraform Cloud or Vault for secrets management
