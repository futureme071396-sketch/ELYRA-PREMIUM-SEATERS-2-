/**
 * Secure Savings Calculator
 * Handles all financial calculations with validation
 */

class Calculator {
    constructor() {
        this.initializeCalculator();
    }

    initializeCalculator() {
        this.setupEventListeners();
        this.loadInitialValues();
    }

    setupEventListeners() {
        // Rate limiting for calculator inputs
        const inputs = ['currentDiesel', 'monthlyKm', 'vehicleCount'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', Security.debounce(() => {
                    this.validateAndCalculate();
                }, 300));
            }
        });

        const modelSelect = document.getElementById('ppaModel');
        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                this.validateAndCalculate();
            });
        }
    }

    loadInitialValues() {
        // Set safe default values
        const defaults = {
            currentDiesel: 250000,
            monthlyKm: 2000,
            vehicleCount: 1,
            ppaModel: 'exchange'
        };

        Object.entries(defaults).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'number') {
                    element.value = value;
                } else if (element.tagName === 'SELECT') {
                    element.value = value;
                }
            }
        });

        this.validateAndCalculate();
    }

    validateAndCalculate() {
        if (!Security.checkRateLimit('calculator_usage', 10)) {
            this.showError('Please wait before making more calculations');
            return;
        }

        try {
            const inputs = this.getValidatedInputs();
            if (!inputs) return;

            const results = this.calculateSavings(inputs);
            this.displayResults(results);
            
        } catch (error) {
            console.error('Calculator error:', error);
            this.showError('An error occurred during calculation');
        }
    }

    getValidatedInputs() {
        const dieselCost = this.validateNumberInput('currentDiesel', 50000, 1000000);
        const monthlyKm = this.validateNumberInput('monthlyKm', 100, 10000);
        const vehicleCount = this.validateNumberInput('vehicleCount', 1, 50);
        const ppaModel = this.validateSelectInput('ppaModel');

        if (dieselCost === null || monthlyKm === null || vehicleCount === null || !ppaModel) {
            return null;
        }

        return { dieselCost, monthlyKm, vehicleCount, ppaModel };
    }

    validateNumberInput(elementId, min, max) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const value = parseFloat(element.value);
        
        if (isNaN(value) || value < min || value > max) {
            this.showFieldError(elementId, `Please enter a value between ${min.toLocaleString()} and ${max.toLocaleString()}`);
            return null;
        }

        this.clearFieldError(elementId);
        return value;
    }

    validateSelectInput(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const value = element.value;
        const validOptions = ['exchange', 'traditional', 'lease'];

        if (!validOptions.includes(value)) {
            this.showFieldError(elementId, 'Please select a valid option');
            return null;
        }

        this.clearFieldError(elementId);
        return value;
    }

    calculateSavings(inputs) {
        const { dieselCost, monthlyKm, vehicleCount, ppaModel } = inputs;
        
        const currentMonthlyCost = dieselCost * vehicleCount;
        let newMonthlyCost;

        switch(ppaModel) {
            case 'exchange':
                newMonthlyCost = 120000 * vehicleCount;
                break;
            case 'traditional':
                newMonthlyCost = (95000 * vehicleCount) + (14 * monthlyKm * vehicleCount);
                break;
            case 'lease':
                newMonthlyCost = 175000 * vehicleCount;
                break;
            default:
                newMonthlyCost = currentMonthlyCost;
        }

        const monthlySavings = currentMonthlyCost - newMonthlyCost;
        const savingsPercent = monthlySavings > 0 ? (monthlySavings / currentMonthlyCost) * 100 : 0;
        const annualSavings = monthlySavings * 12;

        return {
            currentMonthlyCost,
            newMonthlyCost,
            monthlySavings,
            savingsPercent,
            annualSavings
        };
    }

    displayResults(results) {
        this.updateElement('currentCost', this.formatCurrency(results.currentMonthlyCost));
        this.updateElement('newCost', this.formatCurrency(results.newMonthlyCost));
        this.updateElement('savings', this.formatCurrency(results.monthlySavings));
        this.updateElement('savingsPercent', `${Math.max(0, results.savingsPercent).toFixed(0)}%`);
        this.updateElement('annualSavings', this.formatCurrency(results.annualSavings));

        // Visual feedback
        const savingsElement = document.getElementById('savings');
        if (savingsElement) {
            savingsElement.parentElement.classList.toggle('positive-savings', results.monthlySavings > 0);
            savingsElement.parentElement.classList.toggle('negative-savings', results.monthlySavings < 0);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }

    showFieldError(fieldId, message) {
        this.clearFieldError(fieldId);
        
        const field = document.getElementById(fieldId);
        if (!field) return;

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.id = `${fieldId}-error`;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        field.classList.add('error');
    }

    clearFieldError(fieldId) {
        const existingError = document.getElementById(`${fieldId}-error`);
        if (existingError) {
            existingError.remove();
        }
        
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('error');
        }
    }

    showError(message) {
        // Implementation for global error display
        console.error('Calculator Error:', message);
    }
}

// Add debounce to Security framework
Security.debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
