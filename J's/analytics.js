/**
 * Privacy-Focused Analytics
 * No external tracking, only basic usage metrics
 */

class PrivacyAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.pageViews = new Set();
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackUserInteractions();
        this.trackFormInteractions();
        this.setupPerformanceMonitoring();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackPageView() {
        const page = window.location.hash.substring(1) || 'home';
        this.pageViews.add(page);
        
        console.log('Page View:', {
            sessionId: this.sessionId,
            page: page,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        });
    }

    trackUserInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, a[href^="#"]')) {
                const target = e.target.tagName === 'A' ? e.target.getAttribute('href') : e.target.textContent;
                
                console.log('User Interaction:', {
                    sessionId: this.sessionId,
                    type: 'click',
                    target: target.substring(0, 50), // Limit length
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Calculator usage
        document.addEventListener('input', Security.debounce((e) => {
            if (e.target.matches('#currentDiesel, #monthlyKm, #vehicleCount')) {
                console.log('Calculator Interaction:', {
                    sessionId: this.sessionId,
                    type: 'calculator_input',
                    field: e.target.id,
                    timestamp: new Date().toISOString()
                });
            }
        }, 1000));
    }

    trackFormInteractions() {
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                console.log('Form Submission:', {
                    sessionId: this.sessionId,
                    type: 'form_submit',
                    formId: e.target.id,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    setupPerformanceMonitoring() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const navigationTiming = performance.getEntriesByType('navigation')[0];
                const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
                
                console.log('Performance Metrics:', {
                    sessionId: this.sessionId,
                    loadTime: Math.round(loadTime),
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    // Method to get basic analytics summary (for internal use)
    getSummary() {
        return {
            sessionId: this.sessionId,
            totalPageViews: this.pageViews.size,
            pagesViewed: Array.from(this.pageViews),
            sessionStart: new Date().toISOString()
        };
    }
}

// Initialize analytics
const Analytics = new PrivacyAnalytics();
