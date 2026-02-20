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

        // Zero-Downtime Migration Guide warnings
        return this.getMigrationWarning(this.currentStepIndex);
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

        // Zero-Downtime Migration Guide command examples
        return this.getMigrationCommandExample(this.currentStepIndex);
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
}

const guide = new MigrationGuide();
