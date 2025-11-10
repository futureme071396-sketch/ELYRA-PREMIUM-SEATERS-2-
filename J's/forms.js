/**
 * Secure Form Handling System
 * Manages all form submissions with validation and security
 */

class FormHandler {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        this.initializeContactForm();
        this.setupGlobalFormHandler();
    }

    initializeContactForm() {
        const formHTML = `
            <section class="contact-section" aria-labelledby="contact-heading">
                <div class="container">
                    <h2 id="contact-heading">Start Your Premium Electric Journey</h2>
                    <p class="section-subtitle">Get a free fleet assessment and customized premium proposal</p>
                    
                    <div class="contact-grid">
                        <div class="contact-info">
                            <h3>Contact Information</h3>
                            <div class="contact-item">
                                <strong>Phone:</strong> +254 700 000 000
                            </div>
                            <div class="contact-item">
                                <strong>Email:</strong> info@elyrapremium.co.ke
                            </div>
                            <div class="contact-item">
                                <strong>Location:</strong> Nairobi, Kenya
                            </div>
                            <div class="contact-item">
                                <strong>Business Hours:</strong> Mon-Fri 8:00-17:00
                            </div>
                        </div>
                        
                        <form id="contactForm" class="contact-form" novalidate>
                            <div class="form-group">
                                <label for="name" class="sr-only">Your Name</label>
                                <input type="text" id="name" name="name" placeholder="Your Name" required
                                       aria-required="true">
                            </div>
                            <div class="form-group">
                                <label for="email" class="sr-only">Your Email</label>
                                <input type="email" id="email" name="email" placeholder="Your Email" required
                                       aria-required="true">
                            </div>
                            <div class="form-group">
                                <label for="phone" class="sr-only">Your Phone</label>
                                <input type="tel" id="phone" name="phone" placeholder="Your Phone" required
                                       aria-required="true">
                            </div>
                            <div class="form-group">
                                <label for="businessType" class="sr-only">Business Type</label>
                                <select id="businessType" name="businessType" required aria-required="true">
                                    <option value="">Select Business Type</option>
                                    <option value="safari-lodge">Safari Lodge</option>
                                    <option value="tour-operator">Tour Operator</option>
                                    <option value="corporate">Corporate Transport</option>
                                    <option value="luxury-travel">Luxury Travel Company</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="vehicleCount" class="sr-only">Number of Vehicles</label>
                                <select id="vehicleCount" name="vehicleCount" required aria-required="true">
                                    <option value="">Number of Vehicles</option>
                                    <option value="1-3">1-3 Vehicles</option>
                                    <option value="4-6">4-6 Vehicles</option>
                                    <option value="7-10">7-10 Vehicles</option>
                                    <option value="10+">10+ Vehicles</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="message" class="sr-only">Your Message</label>
                                <textarea id="message" name="message" placeholder="Tell us about your premium transport needs..." 
                                         rows="4" aria-required="false"></textarea>
                            </div>
                            <button type="submit" class="btn-primary">Get Free Premium Assessment</button>
                        </form>
                    </div>
                </div>
            </section>
        `;

        // This would be injected by the navigation system
        // For now, we'll handle form submission globally
    }

    setupGlobalFormHandler() {
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });

        // Real-time validation
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);

        // Clear errors on input
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.clearFieldError(e.target);
            }
        });
    }

    async handleFormSubmission(form) {
        if (!Security.checkRateLimit('form_submission', 3)) {
            this.showNotification('Please wait before submitting another form', 'error');
            return;
        }

        // Validate all fields
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Please fix the errors in the form before submitting', 'error');
            return;
        }

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        this.setLoadingState(submitButton, true);

        try {
            const formData = this.collectFormData(form);
            await this.processFormSubmission(formData);
            
            this.showNotification('Thank you! We have received your inquiry and will contact you within 24 hours.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        } finally {
            this.setLoadingState(submitButton, false, originalText);
        }
    }

    collectFormData(form) {
        const data = new FormData(form);
        const sanitizedData = {};

        for (let [key, value] of data.entries()) {
            sanitizedData[key] = InputValidator.sanitizeInput(value);
        }

        // Add security metadata
        sanitizedData._csrf = Security.csrfToken;
        sanitizedData._timestamp = new Date().toISOString();
        sanitizedData._userAgent = navigator.userAgent.substring(0, 100); // Limit length

        return sanitizedData;
    }

    async processFormSubmission(formData) {
        // In a real application, you would send this to your backend
        // For now, we'll simulate the API call
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random failures for testing (10% failure rate)
                if (Math.random() < 0.1) {
                    reject(new Error('Network error'));
                } else {
                    // Simulate successful submission
                    console.log('Form data would be sent to:', {
                        endpoint: '/api/contact',
                        data: formData
                    });
                    resolve({ success: true, id: `sub_${Date.now()}` });
                }
            }, 1500);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Type-specific validation
        if (isValid && value) {
            switch (field.type) {
                case 'email':
                    if (!InputValidator.validateEmail(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                    if (!InputValidator.validatePhone(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid Kenyan phone number';
                    }
                    break;
                case 'text':
                    if (field.name === 'name' && !InputValidator.validateName(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid name (2-50 characters)';
                    }
                    break;
            }
        }

        // Select validation
        if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Please select an option';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.id = `${field.id}-error`;
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('error');
        
        const existingError = document.getElementById(`${field.id}-error`);
        if (existingError) {
            existingError.remove();
        }
    }

    setLoadingState(button, isLoading, originalText = '') {
        if (isLoading) {
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
            button.textContent = 'Sending...';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.setAttribute('aria-disabled', 'false');
            button.textContent = originalText;
            button.classList.remove('loading');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.global-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `global-notification global-notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--white)',
            fontWeight: 'var(--font-weight-medium)',
            zIndex: '10000',
            maxWidth: '400px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid transparent'
        });

        if (type === 'success') {
            notification.style.background = 'var(--success-green)';
        } else if (type === 'error') {
            notification.style.background = 'var(--error-red)';
        } else {
            notification.style.background = 'var(--luxury-navy)';
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}
