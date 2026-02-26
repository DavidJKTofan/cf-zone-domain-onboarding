class MigrationGuide {
    constructor() {
        this.steps = [];
        this.currentStepIndex = 0;
        // Detect guide slug from URL for guide-specific state storage
        const pathMatch = window.location.pathname.match(/^\/guide\/([a-z0-9-]+)/);
        this.guideSlug = pathMatch ? pathMatch[1] : 'zero-downtime-migration';
        this.storageKey = `cf-guide-state-${this.guideSlug}`;
        this.state = this.loadState();
        this.init();
    }

    async init() {
        await this.loadGuideMetadata();
        await this.loadSteps();
        this.checkUrlHash();
        this.renderStepNav();
        this.renderCurrentStep();
        this.updateProgress();
        this.setupHashListener();
    }

    async loadGuideMetadata() {
        // Static header content (title, subtitle, description) for each guide
        const guideHeaders = {
            'zero-downtime-migration': {
                title: 'Cloudflare Zero-Downtime Migration',
                subtitle: 'Domain migration checklist with Partial (CNAME) Setup to Full Setup',
                description: 'This interactive guide helps you safely migrate your domain to Cloudflare with zero downtime. Test configurations before making DNS changes, then transition to full Cloudflare management with confidence.',
                pageTitle: 'Cloudflare Zero-Downtime Migration Guide'
            },
            'cloudflare-for-saas': {
                title: 'Cloudflare for SaaS & Custom Hostnames',
                subtitle: 'Extend security and performance benefits to your customers via custom domains',
                description: 'This interactive guide helps you onboard Cloudflare for SaaS, enabling you to extend Cloudflare\'s security and performance benefits to your customers via their own custom or vanity domains.',
                pageTitle: 'Cloudflare for SaaS & Custom Hostnames Onboarding Guide'
            },
            'sase-onboarding': {
                title: 'Cloudflare One SASE & Zero Trust',
                subtitle: 'Deploy Zero Trust security with ZTNA, SWG, and network connectivity',
                description: 'This interactive guide helps you deploy Cloudflare One SASE platform for your organization. Connect users and networks, configure security policies, and enable Zero Trust access controls.',
                pageTitle: 'Cloudflare One SASE & Zero Trust Onboarding Guide'
            }
        };

        const headerData = guideHeaders[this.guideSlug] || guideHeaders['zero-downtime-migration'];

        // Fetch version from registry API
        let version = '';
        try {
            const response = await fetch(`/api/guides/${this.guideSlug}`);
            if (response.ok) {
                const guideData = await response.json();
                version = guideData.version ? `v${guideData.version}` : '';
            }
        } catch (error) {
            console.warn('Failed to fetch guide metadata:', error);
        }

        // Update page title and meta description
        document.getElementById('page-title').textContent = headerData.pageTitle;
        document.getElementById('page-description')?.setAttribute('content', headerData.description);

        // Update header content
        document.getElementById('guide-title').textContent = headerData.title;
        document.getElementById('guide-subtitle').textContent = headerData.subtitle;
        document.getElementById('guide-version').textContent = version;
        document.getElementById('guide-description').textContent = headerData.description;
    }

    async loadSteps() {
        try {
            // Detect guide slug from URL path (e.g., /guide/sase-onboarding)
            const pathMatch = window.location.pathname.match(/^\/guide\/([a-z0-9-]+)/);
            const guideSlug = pathMatch ? pathMatch[1] : 'zero-downtime-migration';
            const apiUrl = `/api/steps/${guideSlug}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            this.steps = data.steps;

            // Restore checkpoint state and current step
            if (this.state.currentStep !== undefined) {
                this.currentStepIndex = Math.min(this.state.currentStep, this.steps.length - 1);
            }
            if (this.state.checkpoints) {
                this.steps.forEach((step, stepIndex) => {
                    step.checkpoints.forEach((checkpoint, checkIndex) => {
                        const stateKey = `${stepIndex}-${checkIndex}`;
                        if (this.state.checkpoints[stateKey]) {
                            checkpoint.completed = true;
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load steps:', error);
        }
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : { currentStep: 0, checkpoints: {} };
    }

    saveState() {
        const checkpoints = {};
        this.steps.forEach((step, stepIndex) => {
            step.checkpoints.forEach((checkpoint, checkIndex) => {
                if (checkpoint.completed) {
                    checkpoints[`${stepIndex}-${checkIndex}`] = true;
                }
            });
        });

        this.state = {
            currentStep: this.currentStepIndex,
            checkpoints,
        };

        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    renderStepNav() {
        const navList = document.getElementById('step-nav-list');
        navList.innerHTML = '';

        let currentPhase = -1;

        this.steps.forEach((step, index) => {
            // Add phase header when entering a new phase
            if (step.phase !== currentPhase) {
                currentPhase = step.phase;
                const phaseHeader = document.createElement('div');
                phaseHeader.className = 'phase-header';
                phaseHeader.innerHTML = `
                    <div class="phase-number">Phase ${step.phase}</div>
                    <div class="phase-title">${step.phaseTitle}</div>
                `;
                navList.appendChild(phaseHeader);
            }

            const item = document.createElement('div');
            item.className = 'step-nav-item';
            if (index === this.currentStepIndex) item.classList.add('active');
            if (this.isStepCompleted(index)) item.classList.add('completed');

            item.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-title-sidebar">${step.title}</div>
            `;

            item.addEventListener('click', () => {
                this.navigateToStep(index);
            });

            navList.appendChild(item);
        });
    }

    renderCurrentStep() {
        const container = document.getElementById('step-container');
        const step = this.steps[this.currentStepIndex];

        if (this.currentStepIndex === this.steps.length) {
            container.innerHTML = `
                <div class="completion-screen">
                    <div class="completion-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2>Migration Complete</h2>
                    <p>Your domain has been successfully migrated to Cloudflare with zero downtime.</p>
                    <button class="btn btn-primary" onclick="guide.resetMigration()">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Start New Migration
                    </button>
                </div>
            `;
            return;
        }

        // Generate warnings and command examples based on guide type and step
        const warningHtml = this.getStepWarning();
        const commandExample = this.getStepCommandExample();

        const checkpointsHtml = step.checkpoints
            .map(
                (checkpoint, index) => `
                <div class="checkpoint ${checkpoint.completed ? 'completed' : ''} ${checkpoint.optional ? 'optional' : ''}"
                        data-step-index="${this.currentStepIndex}"
                        data-checkpoint-index="${index}"
                        onclick="guide.handleCheckpointClick(event, ${this.currentStepIndex}, ${index})">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" ${checkpoint.completed ? 'checked' : ''} tabindex="-1">
                        <div class="checkbox-custom">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <div class="checkpoint-label">${checkpoint.label}</div>
                    <span class="checkpoint-badge ${checkpoint.optional ? 'optional' : 'required'}">${checkpoint.optional ? 'Optional' : 'Required'}</span>
                </div>
            `
            )
            .join('');

        const docsHtml = step.documentation
            .map(
                (url) => `
                <a href="${url}" target="_blank" rel="noopener">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    ${this.formatDocUrl(url)}
                </a>
            `
            )
            .join('');

        const imagesHtml = step.images && step.images.length > 0 ? `
            <div class="step-images">
                <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Visual Guide
                </h3>
                <div class="images-gallery">
                    ${step.images.map(img => `
                        <div class="image-placeholder">
                            <img src="${img}" alt="${step.title}" onerror="this.parentElement.classList.add('image-missing')">
                            <span class="image-missing-text">Image will be added here</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        const dashboardLinkHtml = step.dashboardLink ? `
            <div class="dashboard-link-container">
                <a href="${step.dashboardLink}" target="_blank" rel="noopener" class="btn-dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Open in Cloudflare Dashboard
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        ` : '';

        // Create time badge HTML if estimatedTime field exists
        const timeBadgeHtml = step.estimatedTime ? `<div class="time-badge" title="Estimated time - actual duration may vary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="time-estimate-label">~</span>${step.estimatedTime}
        </div>` : '';

        // Create Terraform files section if terraformFiles exist
        const terraformFilesHtml = step.terraformFiles && step.terraformFiles.length > 0 ? `
            <div class="terraform-files-section">
                <div class="terraform-files-header">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <h4>Terraform Templates (Provider v5)</h4>
                </div>
                <p class="terraform-description">Ready-to-use Terraform configuration files for Cloudflare Provider v5. Click to view or download.</p>
                <div class="terraform-files-grid">
                    ${step.terraformFiles.map(file => `
                        <div class="terraform-file-card" data-file-path="${file.path}" onclick="guide.viewTerraformFile('${file.path}', '${file.name}')">
                            <div class="terraform-file-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div class="terraform-file-info">
                                <span class="terraform-file-name">${file.name}</span>
                                <span class="terraform-file-desc">${file.description}</span>
                            </div>
                            <div class="terraform-file-actions">
                                <button class="btn-icon" onclick="event.stopPropagation(); guide.downloadTerraformFile('${file.path}', '${file.name}')" title="Download file">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="terraform-actions">
                    <button class="btn btn-secondary" onclick="guide.downloadAllTerraformFiles()">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download All Files (.zip)
                    </button>
                    <a href="https://github.com/cloudflare/terraform-provider-cloudflare" target="_blank" rel="noopener" class="btn btn-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Provider GitHub
                    </a>
                </div>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="step-header">
                <div class="step-header-top">
                    <div class="step-badge">Step ${this.currentStepIndex + 1} of ${this.steps.length}</div>
                    ${timeBadgeHtml}
                </div>
                <h2 class="step-title">${step.title}</h2>
                <p class="step-description">${step.description}</p>
            </div>

            ${warningHtml}
            ${commandExample}
            ${terraformFilesHtml}
            ${imagesHtml}
            ${dashboardLinkHtml}

            <div class="checkpoints">
                <div class="checkpoints-header">
                    <h3>Checkpoints</h3>
                </div>
                ${checkpointsHtml}
            </div>

            <div class="documentation">
                <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Official Documentation
                </h3>
                <div class="documentation-links">
                    ${docsHtml}
                </div>
            </div>

            <div class="step-actions">
                <button class="btn btn-secondary" onclick="guide.previousStep()" ${this.currentStepIndex === 0 ? 'disabled' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>
                <button class="btn btn-primary" onclick="guide.nextStep()" ${!this.canProceed() ? 'disabled' : ''}>
                    ${this.currentStepIndex === this.steps.length - 1 ? 'Complete Migration' : 'Next Step'}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        `;
    }

    /**
     * Get step-specific warning/info alerts based on guide and step
     */
    getStepWarning() {
        const step = this.steps[this.currentStepIndex];
        if (!step) return '';

        // SASE Onboarding Guide warnings
        if (this.guideSlug === 'sase-onboarding') {
            return this.getSaseWarning(step.id);
        }

        // Cloudflare for SaaS Guide warnings
        if (this.guideSlug === 'cloudflare-for-saas') {
            return this.getSaasWarning(step.id);
        }

        // Zero-Downtime Migration Guide warnings
        if (this.guideSlug === 'zero-downtime-migration') {
            return this.getMigrationWarning(this.currentStepIndex);
        }

        // Default: no warnings for unknown guides
        return '';
    }

    /**
     * SASE/Zero Trust onboarding specific warnings
     */
    getSaseWarning(stepId) {
        const warnings = {
            'identity-provider': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Best Practice:</strong> Configure your IdP to require MFA for all authentication flows. For Azure AD/Entra ID, consider setting up Conditional Access policies to limit session lifetime and require re-authentication for Zero Trust flows.</div>
                </div>
            `,
            'connect-private-network': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Tunnel Best Practices:</strong> Deploy cloudflared in an isolated DMZ network with minimum 2 replicas for HA. Ensure your firewall allows outbound UDP/7844 for QUIC protocol. For high-traffic environments, increase Linux file descriptors to 100000 and expand ephemeral port range (12000-60999). Consider dedicated tunnels for critical services like DNS and Active Directory.</div>
                </div>
            `,
            'warp-deployment': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>WARP Configuration:</strong> Use "Exclude" mode for Split Tunnel and remove only the RFC1918 ranges your internal network uses. Enable multi-user mode from the start via MDM. For Managed Networks, use IP:Port detection (not FQDN). Lock WARP switch in production and disable user updates (manage via MDM instead).</div>
                </div>
            `,
            'gateway-dns': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Policy Naming Convention:</strong> Use a consistent naming format: <code>&lt;Source&gt;-DNS-&lt;Destination&gt;-&lt;Purpose&gt;</code>. Example: <code>All-DNS-SecurityCategories-Blacklist</code>. Order matters: whitelist trusted domains first, then block security threats, content categories, and applications.</div>
                </div>
            `,
            'gateway-network': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Zero Trust Principle:</strong> Implement implicit deny at the bottom of your network policies. Only explicitly allowed traffic should reach internal networks. Create policies for quarantined users and devices that fail posture checks to restrict their access automatically.</div>
                </div>
            `,
            'gateway-http': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>TLS Inspection:</strong> Create "Do Not Inspect" policies first for certificate-pinned applications, Android-specific apps (Google Drive), sensitive categories (Health, Finance), and internal network traffic. This prevents connectivity issues when TLS decryption is enabled.</div>
                </div>
            `,
            'access-applications': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>BeyondCorp Model:</strong> Migrate users from VPN to Access-protected applications. Start with commonly used web apps, then SSH/RDP via Browser Rendering. Validate JWT tokens at the application layer for defense-in-depth. Goal: Minimize users who need full WARP tunnel access.</div>
                </div>
            `,
            'warp-session-timeout': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Session Timeout:</strong> 12-hour timeout balances security and user experience. <strong>Critical:</strong> Exclude basic services (DNS servers, IdP, MDM, Domain Controllers) from session timeout to ensure re-authentication works. Active TCP sessions won't terminate until the connection ends.</div>
                </div>
            `,
            'device-posture': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Device Posture:</strong> Create Network policies that restrict access when baseline posture checks fail (OS version, disk encryption, domain joined). Integrate with EDR providers (CrowdStrike, Intune) for real-time device health scoring. Consider "Device Information Only" mode for posture checks without traffic routing.</div>
                </div>
            `,
            'testing-validation': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Testing Checklist:</strong> Test with IT/Security team first. Verify: private app access through tunnel, DNS blocks (use test domains), HTTP inspection and blocks, Access application policies, device posture enforcement, and session timeout re-authentication. Review logs for false positives before broader rollout.</div>
                </div>
            `,
        };

        return warnings[stepId] || '';
    }

    /**
     * Cloudflare for SaaS guide specific warnings
     */
    getSaasWarning(stepId) {
        const warnings = {
            'enable-saas': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Guide Terminology:</strong> Throughout this guide, we use the following example hostnames:<br>
                    <code>saas.customer.com</code> = <strong>Custom Hostname</strong> (your customer's vanity domain pointing to your SaaS platform)<br>
                    <code>*.customers.example.com</code> = <strong>CNAME Target</strong> (wildcard DNS record; customers point to e.g., <code>customer1.customers.example.com</code>)<br>
                    <code>fallback.example.com</code> = <strong>Fallback Origin</strong> (where Cloudflare routes custom hostname traffic by default)</div>
                </div>
            `,
            'create-fallback-origin': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Important:</strong> The fallback origin must be a proxied (orange cloud) DNS record and cannot be the zone apex (root domain). Use a subdomain like <code>fallback.example.com</code>.</div>
                </div>
            `,
            'create-test-hostname': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Orange-to-Orange (O2O):</strong> If your customer also uses Cloudflare for their zone, they can create a <strong>proxied CNAME record</strong> pointing to your CNAME target, enabling O2O. Traffic flows through both zones: customer zone settings apply first, then your SaaS zone settings. O2O requires: (1) zones in different Cloudflare accounts, (2) CNAME-based setup (not apex A records), and (3) an active custom hostname. <a href="https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/saas-customers/how-it-works/" target="_blank" rel="noopener">Learn more about O2O</a></div>
                </div>
            `,
            'complete-validation': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Validation Methods:</strong> TXT validation is recommended for pre-validation before DNS cutover. HTTP validation requires the customer's CNAME to already point to your fallback origin. It is highly recommended to set up Delegated DCV for automated certificate renewals.</div>
                </div>
            `,
            'customer-dns-config': `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Critical:</strong> Ensure both <strong>Certificate status</strong> and <strong>Hostname status</strong> show <strong>Active</strong> before instructing your customer to update their DNS. Premature DNS changes will result in SSL errors.</div>
                </div>
                <div class="alert alert-info" style="margin-top: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Traffic Flow Visualization:</strong>
                    <div style="font-family: monospace; background: var(--bg-tertiary, #1a1a2e); padding: 1rem; border-radius: 8px; margin-top: 0.5rem; overflow-x: auto;">
                        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                            <span style="background: #f97316; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">Visitor</span>
                            <span style="color: #888;">--&gt;</span>
                            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">saas.customer.com</span>
                            <span style="color: #888;">--&gt;</span>
                            <span style="background: #8b5cf6; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">customer1.customers.example.com</span>
                            <span style="color: #888;">--&gt;</span>
                            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">fallback.example.com</span>
                            <span style="color: #888;">--&gt;</span>
                            <span style="background: #6b7280; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">Origin Server</span>
                        </div>
                        <div style="margin-top: 0.75rem; font-size: 0.85rem; color: #888;">
                            <div><strong style="color: #3b82f6;">Custom Hostname</strong> (customer's vanity domain) <span style="color: #666;">CNAME to</span></div>
                            <div><strong style="color: #8b5cf6;">CNAME Target</strong> (matches *.customers.example.com wildcard) <span style="color: #666;">resolves to</span></div>
                            <div><strong style="color: #10b981;">Fallback Origin</strong> (your proxied DNS record) <span style="color: #666;">routes to</span></div>
                            <div><strong style="color: #6b7280;">Origin Server</strong> (your backend infrastructure)</div>
                        </div>
                    </div>
                    </div>
                </div>
            `,
            'custom-metadata': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Custom Metadata Best Practices:</strong> Use a flat JSON structure with snake_case keys. Keep schema consistent across all hostnames. Define fallback behavior in Workers for missing metadata. Changes propagate within 30 seconds.</div>
                </div>
            `,
            'verify-hostnames': `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Verification:</strong> A successful custom hostname setup will show the <code>cf-ray</code> header in HTTP responses. Use <code>curl -I https://saas.customer.com</code> to verify traffic is flowing through Cloudflare.</div>
                </div>
            `,
        };

        return warnings[stepId] || '';
    }

    /**
     * Zero-Downtime Migration guide specific warnings
     */
    getMigrationWarning(stepIndex) {
        if (stepIndex === 1) {
            return `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Zero Downtime:</strong> Converting to Partial (CNAME) Setup does <strong>not</strong> impact your live traffic. Your domain continues to operate normally through your existing DNS provider while you configure and test Cloudflare. Traffic only routes through Cloudflare when you explicitly enable it.</div>
                </div>
            `;
        } else if (stepIndex === 7) {
            return `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Prerequisites:</strong> Your CNAME Setup zone must be in Active status (TXT verification completed in Step 4) before the dig command will return Cloudflare Anycast IPs. If the zone is not active, dig will not resolve the .cdn.cloudflare.net hostname.</div>
                </div>
            `;
        } else if (stepIndex === 8) {
            return `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>DNSSEC Warning:</strong> If DNSSEC is currently enabled at your authoritative DNS provider, you must either disable it 24 hours before continuing, or set up multi-signer DNSSEC following the advanced guide.</div>
                </div>
            `;
        } else if (stepIndex === 10) {
            return `
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div><strong>Best Practice:</strong> Before changing nameservers in step 13, we recommend setting all DNS records to <strong>DNS-only (gray cloud)</strong> status. This allows you to verify DNS resolution is working correctly through Cloudflare before enabling proxy features. You can enable proxy status (orange cloud) later in Step 14 after confirming the migration is successful.</div>
                </div>
            `;
        } else if (stepIndex === 11) {
            return `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Traffic Impact:</strong> Changing nameservers (NS records) at your registrar <strong>WILL impact live traffic</strong>. However, if you've followed the previous steps and properly prepared (lowered TTL, configured all DNS records, tested thoroughly), the transition should occur smoothly once the DNS TTL expires from your original authoritative DNS provider. Note: While records remain DNS-only (gray cloud), Cloudflare TLS certificates will not apply - your origin must handle TLS directly.</div>
                </div>
            `;
        } else if (stepIndex === 12) {
            return `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Critical:</strong> Before enabling proxy status, ensure your origin firewall allows Cloudflare IP addresses. Blocking Cloudflare IPs will cause downtime when you enable the orange cloud. Review the IP ranges in the documentation.</div>
                </div>
            `;
        }
        return '';
    }

    /**
     * Get step-specific command examples based on guide and step
     */
    getStepCommandExample() {
        const step = this.steps[this.currentStepIndex];
        if (!step) return '';

        // SASE Onboarding Guide command examples
        if (this.guideSlug === 'sase-onboarding') {
            return this.getSaseCommandExample(step.id);
        }

        // Cloudflare for SaaS Guide command examples
        if (this.guideSlug === 'cloudflare-for-saas') {
            return this.getSaasCommandExample(step.id);
        }

        // Zero-Downtime Migration Guide command examples
        if (this.guideSlug === 'zero-downtime-migration') {
            return this.getMigrationCommandExample(this.currentStepIndex);
        }

        // Default: no command examples for unknown guides
        return '';
    }

    /**
     * Cloudflare for SaaS guide specific command examples
     */
    getSaasCommandExample(stepId) {
        const commands = {
            'api-authentication': `
                <div class="command-block">
                    <code># Set up environment variables for API access
export CLOUDFLARE_API_TOKEN="your-api-token-here"
export CLOUDFLARE_ZONE_ID="your-zone-id-here"

# Verify API token permissions
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\
    -H "Content-Type: application/json"</code>
                </div>
            `,
            'api-fallback-origin': `
                <div class="command-block">
                    <code># Set fallback origin via API
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames/fallback_origin" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\
    -H "Content-Type: application/json" \\
    --data '{"origin":"fallback.example.com"}'

# Get current fallback origin
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames/fallback_origin" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"</code>
                </div>
            `,
            'api-custom-hostnames': `
                <div class="command-block">
                    <code># Create a custom hostname
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\
    -H "Content-Type: application/json" \\
    --data '{
        "hostname": "saas.customer.com",
        "ssl": {
            "method": "txt",
            "type": "dv",
            "settings": {
                "min_tls_version": "1.2"
            }
        }
    }'

# List all custom hostnames
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Get specific custom hostname details
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames/{hostname_id}" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"</code>
                </div>
            `,
            'customer-dns-config': `
                <div class="command-block">
                    <code># Verify customer CNAME is pointing to your CNAME target (wildcard subdomain)
dig +short CNAME saas.customer.com
# Expected output: customer1.customers.example.com.

# Verify the CNAME target resolves correctly (matches *.customers.example.com)
dig +short customer1.customers.example.com
# Expected output: Cloudflare IP addresses (e.g., 104.21.x.x)

# Check if traffic is flowing through Cloudflare
curl -sI https://saas.customer.com | grep -i "cf-ray"
# Expected output: cf-ray: xxxxxxxx-XXX (shows Cloudflare PoP)

# Verify SSL certificate is issued correctly
curl -sI https://saas.customer.com | grep -i "server"
# Expected output: server: cloudflare</code>
                </div>
            `,
            'verify-hostnames': `
                <div class="command-block">
                    <code># Verify custom hostname is working
curl -I https://saas.customer.com

# Check for cf-ray header (confirms traffic through Cloudflare)
curl -sI https://saas.customer.com | grep -i "cf-ray"

# Verify SSL certificate
openssl s_client -connect saas.customer.com:443 -servername saas.customer.com 2>/dev/null | openssl x509 -noout -issuer -dates

# Check hostname status via API
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames?hostname=saas.customer.com" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"</code>
                </div>
            `,
            'custom-origins': `
                <div class="command-block">
                    <code># Create custom hostname with custom origin
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\
    -H "Content-Type: application/json" \\
    --data '{
        "hostname": "premium.customer.com",
        "ssl": {
            "method": "txt",
            "type": "dv"
        },
        "custom_origin_server": "premium-origin.example.com"
    }'</code>
                </div>
            `,
            'custom-metadata': `
                <div class="command-block">
                    <code># Add custom metadata to an existing custom hostname
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/custom_hostnames/$CUSTOM_HOSTNAME_ID" \\
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\
    -H "Content-Type: application/json" \\
    --data '{
        "custom_metadata": {
            "customer_id": "12345",
            "plan_tier": "premium",
            "security_tag": "high",
            "redirect_to_https": true
        }
    }'

# Access metadata in Cloudflare Workers:
# const customerId = request.cf.hostMetadata.customer_id;

# Access metadata in WAF rule expressions:
# lookup_json_string(cf.hostname.metadata, "security_tag") eq "high"</code>
                </div>
            `,
        };

        return commands[stepId] || '';
    }

    /**
     * SASE/Zero Trust onboarding specific command examples
     */
    getSaseCommandExample(stepId) {
        const commands = {
            'connect-private-network': `
                <div class="command-block">
                    <code># Increase file descriptors and ephemeral ports (Linux - run as root)
# These settings are critical for high-traffic tunnel deployments

# Create sysctl configuration for cloudflared
echo 'fs.file-max = 100000' | sudo tee -a /etc/sysctl.d/99-cloudflared.conf
echo 'net.ipv4.ip_local_port_range = 12000 60999' | sudo tee -a /etc/sysctl.d/99-cloudflared.conf
sudo sysctl -p /etc/sysctl.d/99-cloudflared.conf

# Enable ICMP socket permissions for cloudflared
# Check current ping group range
cat /proc/sys/net/ipv4/ping_group_range

# Update to allow cloudflared GID (example: 1000)
echo "1000 1000" | sudo tee /proc/sys/net/ipv4/ping_group_range

# Verify tunnel is using QUIC (check cloudflared logs)
journalctl -u cloudflared.service | grep "protocol"
# Should show: protocol=quic</code>
                </div>
            `,
            'warp-deployment': `
                <div class="command-block">
                    <code># MDM deployment - Example mdm.xml for Windows with best practices
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;dict&gt;
    &lt;key&gt;organization&lt;/key&gt;
    &lt;string&gt;your-team-name&lt;/string&gt;
    &lt;key&gt;allow_updates&lt;/key&gt;
    &lt;false/&gt;
    &lt;key&gt;onboarding&lt;/key&gt;
    &lt;false/&gt;
    &lt;key&gt;multi_user&lt;/key&gt;
    &lt;true/&gt;
    &lt;key&gt;service_mode&lt;/key&gt;
    &lt;string&gt;warp&lt;/string&gt;
&lt;/dict&gt;

# Verify WARP connection status (user device)
warp-cli status
warp-cli settings

# Test split tunnel configuration
# Traffic to these IPs should NOT go through WARP (if in exclude list)
traceroute 10.0.0.1</code>
                </div>
            `,
            'gateway-dns': `
                <div class="command-block">
                    <code># Test DNS filtering is working through Gateway
# These should be blocked if security categories are enabled:

# Test malware domain (safe test domain)
dig malware.testcategory.com

# Test phishing domain
dig phishing.testcategory.com

# Verify DNS goes through Gateway (should see Gateway resolver)
dig whoami.cloudflare TXT +short

# Example DNS policy naming convention:
# All-DNS-Domain-Whitelist (Priority 1)
# All-DNS-SecurityCategories-Blacklist (Priority 2)
# All-DNS-ContentCategories-Blacklist (Priority 3)
# Finance-DNS-Application-Allow (Priority 4)</code>
                </div>
            `,
            'gateway-http': `
                <div class="command-block">
                    <code># Test HTTP inspection is working
# Check if TLS decryption is active (certificate should show Cloudflare)
curl -v https://example.com 2>&1 | grep "issuer"

# Test blocked categories
# Visit: https://www.cloudflare.com/ssl/encrypted-sni/
# This page shows if TLS inspection is working

# Applications that commonly need Do Not Inspect policies:
# - Google Drive (Android)
# - Cisco WebEx
# - Zoom (some features)
# - Banking/Financial apps
# - Healthcare portals

# Use Gateway Analytics to identify inspection issues
# Dashboard: one.dash.cloudflare.com > Logs > Gateway > HTTP</code>
                </div>
            `,
            'gateway-network': `
                <div class="command-block">
                    <code># Test network policy enforcement

# Verify private network connectivity through tunnel
# From WARP-connected device:
ping 10.0.0.100  # Replace with your internal IP

# Test SSH access (if allowed by policy)
ssh user@internal-server.corp.local

# Test blocked ports (should fail if implicit deny is configured)
nc -zv 10.0.0.100 3389  # RDP - should fail if not explicitly allowed

# Network policy naming convention:
# Quarantined-Users-NET-Restricted-Access
# Posture-Fail-NET-Restricted-Access
# FinanceUsers-NET-HTTPS-FinanceServers
# All-NET-InternalNetwork-ImplicitDeny (BOTTOM)</code>
                </div>
            `,
            'testing-validation': `
                <div class="command-block">
                    <code># Pre-rollout testing checklist commands

# 1. Verify tunnel connectivity
curl -I https://internal-app.corp.local

# 2. Test DNS filtering
nslookup malware.testcategory.com

# 3. Verify WARP is connected and policies applied
warp-cli status
warp-cli teams-enroll-status

# 4. Test Access application authentication
# Open browser to: https://app.yourcompany.cloudflareaccess.com

# 5. Check device posture
warp-cli get-device-posture

# 6. Review logs in dashboard
# Gateway DNS: one.dash.cloudflare.com > Logs > Gateway > DNS
# Gateway HTTP: one.dash.cloudflare.com > Logs > Gateway > HTTP
# Access: one.dash.cloudflare.com > Logs > Access</code>
                </div>
            `,
        };

        return commands[stepId] || '';
    }

    /**
     * Zero-Downtime Migration guide specific command examples
     */
    getMigrationCommandExample(stepIndex) {
        if (stepIndex === 2) {
            return `
                <div class="command-block">
                    <code># Verify TXT record has been set at your authoritative DNS provider
dig TXT +short cloudflare-verify.yourdomain.com

# Expected output: the verification token provided by Cloudflare
# Example: "723047471-2..."</code>
                </div>
            `;
        } else if (stepIndex === 7) {
            return `
                <div class="command-block">
                    <code># Important: DNS record must exist in your Cloudflare zone for this to work
# Retrieve Cloudflare Anycast IPs for your proxied hostname
dig +short yourdomain.com.cdn.cloudflare.net

# The .cdn.cloudflare.net suffix only returns IPs if:
# 1. Zone is Active (TXT verification completed)
# 2. DNS record exists in Cloudflare
# 3. Record has proxy enabled (orange cloud)

# Example: Add to /etc/hosts (macOS/Linux)
104.21.XX.XXX yourdomain.com
104.21.XX.XXX www.yourdomain.com

# Windows: C:\\Windows\\System32\\drivers\\etc\\hosts</code>
                </div>
            `;
        }
        return '';
    }

    formatDocUrl(url) {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            // Extract meaningful part of the path
            const parts = path.split('/').filter(Boolean);
            if (parts.length > 2) {
                return parts.slice(-2).join('/') + '/';
            }
            return path;
        } catch {
            return url;
        }
    }

    handleCheckpointClick(event, stepIndex, checkpointIndex) {
        // Prevent double-triggering from checkbox click
        if (event.target.type === 'checkbox') {
            event.preventDefault();
        }
        this.toggleCheckpoint(stepIndex, checkpointIndex);
    }

    toggleCheckpoint(stepIndex, checkpointIndex) {
        const checkpoint = this.steps[stepIndex].checkpoints[checkpointIndex];
        checkpoint.completed = !checkpoint.completed;
        this.renderStepNav();
        this.renderCurrentStep();
        this.updateProgress();
        this.saveState();
    }

    canProceed() {
        const step = this.steps[this.currentStepIndex];
        return step.checkpoints.filter((cp) => !cp.optional).every((cp) => cp.completed);
    }

    isStepCompleted(stepIndex) {
        const step = this.steps[stepIndex];
        return step.checkpoints.filter((cp) => !cp.optional).every((cp) => cp.completed);
    }

    nextStep() {
        if (this.canProceed()) {
            this.navigateToStep(this.currentStepIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.navigateToStep(this.currentStepIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    resetMigration() {
        if (this.steps.some((step) => step.checkpoints.some((cp) => cp.completed))) {
            if (!confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
                return;
            }
        }

        // Clear all checkpoints
        this.steps.forEach((step) => {
            step.checkpoints.forEach((checkpoint) => {
                checkpoint.completed = false;
            });
        });

        // Reset to first step
        this.currentStepIndex = 0;

        // Clear localStorage for this guide
        localStorage.removeItem(this.storageKey);
        this.state = { currentStep: 0, checkpoints: {} };

        // Clear URL hash
        window.history.pushState(null, '', window.location.pathname);

        // Re-render everything
        this.renderStepNav();
        this.renderCurrentStep();
        this.updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navigateToStep(index) {
        this.currentStepIndex = index;
        window.history.pushState(null, '', `#step-${index + 1}`);
        this.renderStepNav();
        this.renderCurrentStep();
        this.updateProgress();
        this.saveState();
    }

    checkUrlHash() {
        const hash = window.location.hash.slice(1);
        if (hash && hash.startsWith('step-')) {
            const stepNumber = parseInt(hash.replace('step-', ''), 10);
            if (!isNaN(stepNumber) && stepNumber > 0 && stepNumber <= this.steps.length) {
                this.currentStepIndex = stepNumber - 1;
            }
        }
    }

    setupHashListener() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash && hash.startsWith('step-')) {
                const stepNumber = parseInt(hash.replace('step-', ''), 10);
                if (!isNaN(stepNumber) && stepNumber > 0 && stepNumber <= this.steps.length) {
                    const stepIndex = stepNumber - 1;
                    if (stepIndex !== this.currentStepIndex) {
                        this.currentStepIndex = stepIndex;
                        this.renderStepNav();
                        this.renderCurrentStep();
                        this.updateProgress();
                        this.saveState();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            }
        });
    }

    updateProgress() {
        // Exclude steps that only have optional checkpoints from progress calculation
        // This includes steps where all checkpoints are optional
        const stepsToCount = this.steps.filter((step) => {
            // Check if step has at least one required checkpoint
            const hasRequiredCheckpoints = step.checkpoints.some(cp => !cp.optional);
            // Exclude specific step IDs that are entirely optional
            const excludedStepIds = ['iac-cicd', 'egress-policies'];
            return hasRequiredCheckpoints && !excludedStepIds.includes(step.id);
        });

        const totalSteps = stepsToCount.length;
        const completedSteps = stepsToCount.filter((step) => {
            const stepIndex = this.steps.indexOf(step);
            return this.isStepCompleted(stepIndex);
        }).length;

        const percentage = Math.round((completedSteps / totalSteps) * 100);

        document.getElementById('progress-text').textContent = `Step ${this.currentStepIndex + 1} of ${this.steps.length}`;
        document.getElementById('progress-percentage').textContent = `${percentage}%`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    // Terraform file viewing and downloading methods
    async viewTerraformFile(filePath, fileName) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }
            const content = await response.text();
            this.showTerraformModal(fileName, content, filePath);
        } catch (error) {
            console.error('Failed to load Terraform file:', error);
            alert(`Failed to load ${fileName}. Please try again.`);
        }
    }

    showTerraformModal(fileName, content, filePath) {
        // Remove existing modal if present
        const existingModal = document.getElementById('terraform-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'terraform-modal';
        modal.className = 'terraform-modal';
        modal.innerHTML = `
            <div class="terraform-modal-backdrop" onclick="guide.closeTerraformModal()"></div>
            <div class="terraform-modal-content">
                <div class="terraform-modal-header">
                    <div class="terraform-modal-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span>${fileName}</span>
                    </div>
                    <div class="terraform-modal-actions">
                        <button class="btn btn-secondary btn-sm" onclick="guide.copyTerraformContent()" title="Copy to clipboard">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="guide.downloadTerraformFile('${filePath}', '${fileName}')" title="Download file">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download
                        </button>
                        <button class="btn-icon" onclick="guide.closeTerraformModal()" title="Close">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="terraform-modal-body">
                    <pre class="terraform-code"><code>${this.escapeHtml(content)}</code></pre>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Store content for copy functionality
        this.currentTerraformContent = content;

        // Add escape key listener
        this.terraformModalEscapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeTerraformModal();
            }
        };
        document.addEventListener('keydown', this.terraformModalEscapeHandler);
    }

    closeTerraformModal() {
        const modal = document.getElementById('terraform-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
            if (this.terraformModalEscapeHandler) {
                document.removeEventListener('keydown', this.terraformModalEscapeHandler);
            }
        }
    }

    async copyTerraformContent() {
        if (this.currentTerraformContent) {
            try {
                await navigator.clipboard.writeText(this.currentTerraformContent);
                // Show brief feedback
                const copyBtn = document.querySelector('.terraform-modal-actions .btn-secondary');
                if (copyBtn) {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Copied!
                    `;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                }
            } catch (error) {
                console.error('Failed to copy:', error);
                alert('Failed to copy to clipboard');
            }
        }
    }

    async downloadTerraformFile(filePath, fileName) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
            }
            const content = await response.text();
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download Terraform file:', error);
            alert(`Failed to download ${fileName}. Please try again.`);
        }
    }

    async downloadAllTerraformFiles() {
        const step = this.steps[this.currentStepIndex];
        if (!step.terraformFiles || step.terraformFiles.length === 0) {
            return;
        }

        // Check if JSZip is available, if not, download files individually
        if (typeof JSZip === 'undefined') {
            // Fallback: download files one by one
            for (const file of step.terraformFiles) {
                await this.downloadTerraformFile(file.path, file.name);
                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            return;
        }

        try {
            const zip = new JSZip();
            
            // Fetch all files and add to zip
            const fetchPromises = step.terraformFiles.map(async (file) => {
                const response = await fetch(file.path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${file.name}`);
                }
                const content = await response.text();
                zip.file(file.name, content);
            });

            await Promise.all(fetchPromises);

            // Generate and download zip
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'terraform-cloudflare-v5.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to create zip:', error);
            alert('Failed to download files. Please try downloading individually.');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const guide = new MigrationGuide();
