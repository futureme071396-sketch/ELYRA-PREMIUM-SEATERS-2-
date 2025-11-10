/**
 * Secure Navigation System
 * Handles all navigation and dynamic content loading
 */

class NavigationSystem {
    constructor() {
        this.currentPage = 'home';
        this.pages = new Map();
        this.init();
    }

    init() {
        this.loadNavigation();
        this.setupRouting();
        this.initializeAccessibility();
    }

    loadNavigation() {
        const navHTML = `
            <div class="nav-brand">
                <h2>Elyra<span>Premium</span>Seaters</h2>
            </div>
            <button class="mobile-menu-btn" aria-expanded="false" aria-controls="nav-links">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul id="nav-links" class="nav-links" role="menubar">
                <li role="none"><a href="#home" role="menuitem" data-page="home">Home</a></li>
                <li role="none"><a href="#solutions" role="menuitem" data-page="solutions">Solutions</a></li>
                <li role="none"><a href="#models" role="menuitem" data-page="models">PPA Models</a></li>
                <li role="none"><a href="#calculator" role="menuitem" data-page="calculator">Savings Calculator</a></li>
                <li role="none"><a href="#contact" role="menuitem" data-page="contact">Contact</a></li>
            </ul>
            <div class="nav-cta">
                <button class="btn-primary" data-page="calculator">Calculate Savings</button>
            </div>
        `;

        document.querySelector('.nav').innerHTML = navHTML;
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        menuBtn.addEventListener('click', () => {
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
            menuBtn.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            });
        });
    }

    setupRouting() {
        // Handle hash-based routing
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        window.addEventListener('load', () => {
            this.handleRouteChange();
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]') || e.target.closest('[data-page]')) {
                e.preventDefault();
                const target = e.target.closest('[data-page]');
                const page = target.getAttribute('data-page');
                this.navigateTo(page);
            }
        });
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1) || 'home';
        this.navigateTo(hash);
    }

    navigateTo(page) {
        if (!this.isValidPage(page)) {
            page = 'home';
        }

        this.currentPage = page;
        window.location.hash = page;
        this.loadPageContent(page);
        this.updateActiveNav(page);
    }

    isValidPage(page) {
        const validPages = ['home', 'solutions', 'models', 'calculator', 'contact'];
        return validPages.includes(page);
    }

    async loadPageContent(page) {
        try {
            const content = await this.generatePageContent(page);
            document.querySelector('main').innerHTML = content;
            
            // Initialize page-specific functionality
            this.initializePageFunctionality(page);
            
        } catch (error) {
            console.error('Error loading page content:', error);
            this.loadErrorPage();
        }
    }

    async generatePageContent(page) {
        const pageTemplates = {
            home: this.generateHomePage(),
            solutions: this.generateSolutionsPage(),
            models: this.generateModelsPage(),
            calculator: this.generateCalculatorPage(),
            contact: this.generateContactPage()
        };

        return pageTemplates[page] || this.generateHomePage();
    }

    initializePageFunctionality(page) {
        switch(page) {
            case 'calculator':
                if (typeof Calculator !== 'undefined') {
                    new Calculator();
                }
                break;
            case 'contact':
                if (typeof FormHandler !== 'undefined') {
                    new FormHandler();
                }
                break;
        }
    }

    updateActiveNav(page) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.setAttribute('aria-current', link.getAttribute('data-page') === page ? 'page' : 'false');
            link.classList.toggle('active', link.getAttribute('data-page') === page);
        });
    }

    initializeAccessibility() {
        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            mainContent.focus();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close mobile menu
                document.querySelector('.mobile-menu-btn').setAttribute('aria-expanded', 'false');
                document.querySelector('.nav-links').classList.remove('active');
            }
        });
    }

    // Page content generators will be implemented next
    generateHomePage() {
        return `
            <section class="hero" aria-labelledby="hero-heading">
                <div class="hero-content">
                    <h1 id="hero-heading">Premium Electric Safari Experiences</h1>
                    <p>Luxury Seating. Zero Emissions. Unforgettable Journeys. Upgrade your fleet with premium electric vehicles with $0 upfront cost.</p>
                    <div class="hero-buttons">
                        <button class="btn-primary" data-page="calculator">Calculate Your Savings</button>
                        <button class="btn-secondary" data-page="contact">Book a Demo Safari</button>
                    </div>
                    <div class="hero-stats">
                        <div class="stat">
                            <h3>50-60%</h3>
                            <p>Cost Savings vs Diesel</p>
                        </div>
                        <div class="stat">
                            <h3>KES 0</h3>
                            <p>Upfront Investment</p>
                        </div>
                        <div class="stat">
                            <h3>Premium</h3>
                            <p>Luxury Seating</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Other page generators will follow similar pattern...
}

// Initialize navigation
const Navigation = new NavigationSystem();
