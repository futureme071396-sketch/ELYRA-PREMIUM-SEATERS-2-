/**
 * Elyra Premium Seaters - Security Framework
 * Secure, vanilla JavaScript implementation
 */

class SecurityFramework {
    constructor() {
        this.init();
    }

    init() {
        this.setSecurityHeaders();
        this.preventXSS();
        this.setupCSRFProtection();
        this.initializeRateLimiting();
    }

    setSecurityHeaders() {
        // Meta tags already set in HTML, this is for additional protection
        if (window.console) {
            console.log('%cElyra Premium Seaters - Secure Framework Active', 
                'color: #D4AF37; font-weight: bold; font-size: 16px;');
        }
    }

    preventXSS() {
        // Sanitize input function
        this.sanitize = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        // Prevent inline event handlers
        document.addEventListener('DOMContentLoaded', () => {
            const elements = document.querySelectorAll('[onclick],[onload],[onerror]');
            elements.forEach(el => {
                el.removeAttribute('onclick');
                el.removeAttribute('onload');
                el.removeAttribute('onerror');
            });
        });
    }

    setupCSRFProtection() {
        this.csrfToken = this.generateToken();
        sessionStorage.setItem('csrf_token', this.csrfToken);
    }

    generateToken() {
        return 'elyra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validateCSRF(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return token === storedToken;
    }

    initializeRateLimiting() {
        this.rateLimitStore = new Map();
        
        setInterval(() => {
            this.rateLimitStore.clear();
        }, 60000); // Clear every minute
    }

    checkRateLimit(key, maxRequests = 5) {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window
        
        // Clean old entries
        for (let [storedKey, data] of this.rateLimitStore) {
            if (data.timestamp < windowStart) {
                this.rateLimitStore.delete(storedKey);
            }
        }
        
        const existing = this.rateLimitStore.get(key);
        
        if (!existing) {
            this.rateLimitStore.set(key, {
                count: 1,
                timestamp: now
            });
            return true;
        }
        
        if (existing.count >= maxRequests) {
            return false;
        }
        
        existing.count++;
        existing.timestamp = now;
        return true;
    }

    // Secure fetch wrapper
    async secureFetch(url, options = {}) {
        const defaultOptions = {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, mergedOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Secure fetch error:', error);
            throw error;
        }
    }
}

// Input validation utilities
class InputValidator {
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    }

    static validatePhone(phone) {
        // Kenyan phone number validation
        const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    static validateName(name) {
        return typeof name === 'string' && 
               name.trim().length >= 2 && 
               name.trim().length <= 50 &&
               /^[a-zA-Z\s\-']+$/.test(name);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    static validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }
}

// Initialize security framework
const Security = new SecurityFramework();
