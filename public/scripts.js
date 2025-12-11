class MigrationGuide {
    constructor() {
        this.steps = [];
        this.currentStepIndex = 0;
        this.state = this.loadState();
        this.init();
    }

    async init() {
        await this.loadSteps();
        this.renderStepNav();
        this.renderCurrentStep();
        this.updateProgress();
    }

    async loadSteps() {
        try {
            const response = await fetch('/api/steps');
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
        const saved = localStorage.getItem('cf-migration-state');
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

        localStorage.setItem('cf-migration-state', JSON.stringify(this.state));
    }

    renderStepNav() {
        const navList = document.getElementById('step-nav-list');
        navList.innerHTML = '';

        this.steps.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = 'step-nav-item';
            if (index === this.currentStepIndex) item.classList.add('active');
            if (this.isStepCompleted(index)) item.classList.add('completed');

            item.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-title-sidebar">${step.title}</div>
            `;

            item.addEventListener('click', () => {
                this.currentStepIndex = index;
                this.renderStepNav();
                this.renderCurrentStep();
                this.updateProgress();
                this.saveState();
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

        let warningHtml = '';
        if (this.currentStepIndex === 8) {
            warningHtml = `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>DNSSEC Warning:</strong> If DNSSEC is currently enabled at your authoritative DNS provider, you must either disable it 24 hours before continuing, or set up multi-signer DNSSEC following the advanced guide.</div>
                </div>
            `;
        } else if (this.currentStepIndex === 11) {
            warningHtml = `
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div><strong>Important:</strong> Ensure all DNS records are in place before changing nameservers. While records remain DNS-only (gray cloud), Cloudflare TLS certificates will not apply to traffic—your origin must handle TLS directly.</div>
                </div>
            `;
        }

        let commandExample = '';
        if (this.currentStepIndex === 6) {
            commandExample = `
                <div class="command-block">
                    <code># Retrieve Cloudflare Anycast IPs for your domain
dig +short yourdomain.com.cdn.cloudflare.net

# Example: Add to /etc/hosts (macOS/Linux)
104.21.XX.XXX yourdomain.com
104.21.XX.XXX www.yourdomain.com

# Windows: C:\\Windows\\System32\\drivers\\etc\\hosts</code>
                </div>
            `;
        }

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

        const requiredCount = step.checkpoints.filter((cp) => !cp.optional).length;
        const completedRequired = step.checkpoints.filter((cp) => !cp.optional && cp.completed).length;

        container.innerHTML = `
            <div class="step-header">
                <div class="step-badge">Step ${this.currentStepIndex + 1} of ${this.steps.length}</div>
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
            this.currentStepIndex++;
            this.renderStepNav();
            this.renderCurrentStep();
            this.updateProgress();
            this.saveState();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.renderStepNav();
            this.renderCurrentStep();
            this.updateProgress();
            this.saveState();
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

        // Clear localStorage
        localStorage.removeItem('cf-migration-state');
        this.state = { currentStep: 0, checkpoints: {} };

        // Re-render everything
        this.renderStepNav();
        this.renderCurrentStep();
        this.updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgress() {
        // Exclude steps that only have optional checkpoints (Step 6 and 14)
        const optionalOnlyStepIds = ['protect-origin', 'iac-cicd'];
        
        const requiredSteps = this.steps.filter(step => !optionalOnlyStepIds.includes(step.id));
        const totalSteps = requiredSteps.length;
        
        const completedSteps = this.steps.filter((step, index) => {
            return !optionalOnlyStepIds.includes(step.id) && this.isStepCompleted(index);
        }).length;
        
        const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        document.getElementById('progress-text').textContent = `Step ${this.currentStepIndex + 1} of ${this.steps.length}`;
        document.getElementById('progress-percentage').textContent = `${percentage}%`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }
}

const guide = new MigrationGuide();
