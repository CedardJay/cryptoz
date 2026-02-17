// Mobile menu toggle
document.querySelector('.mobile-menu').addEventListener('click', function () {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');

    if (navLinks.style.display === 'none') {
        navLinks.style.display = 'flex'
        authButtons.style.display = 'flex'
    }
    else {
        navLinks.style.display = 'none'
        authButtons.style.display = 'none'
    }
}
);

//overriding date field with current date
const today = new Date().toISOString().split('T')[0];
document.getElementById('currentDate').value = today;


//Currency Converter
// Get DOM elements
const baseCurrencySelect = document.getElementById('base-currency');
const targetCurrencySelect = document.getElementById('target-currency');
const amountInput = document.querySelector('.input-group input[type="number"]');
const convertedInput = document.querySelectorAll('.input-group input[type="number"]')[1];

// Cache exchange rate to reduce the number of api  calls
let exchangeRates = {};

// Fetch exchange rate from API
async function fetchExchangeRate(base, target) {
    try {
        // This calls Netlify function, NOT the API directly
        const response = await fetch(
            `/api/exchange-rate?base=${base}&target=${target}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        return data.exchange_rates[target];
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        document.getElementById('error-message').innerHTML = "An error occured. Please try again"
        //alert('Error fetching exchange rate. Please try again.');
        return null;
    }
}

// Convert currency
async function convertCurrency() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
    const amount = parseFloat(amountInput.value);

    // Validate input
    if (isNaN(amount) || amount <= 0) {
        convertedInput.value = '0.0000';
        return;
    }

    // If same currency, just copy the value
    if (baseCurrency === targetCurrency) {
        convertedInput.value = amount.toFixed(4);
        return;
    }

    // Create cache key
    const cacheKey = `${baseCurrency}_${targetCurrency}`;

    // Check if we have a recent rate in cache (within last 30 minutes)
    if (exchangeRates[cacheKey] &&
        (Date.now() - exchangeRates[cacheKey].timestamp < 1800000)) {
        const rate = exchangeRates[cacheKey].rate;
        const convertedAmount = amount * rate;
        convertedInput.value = convertedAmount.toFixed(4);
    } else {
        // Fetch new rate
        const rate = await fetchExchangeRate(baseCurrency, targetCurrency);

        if (rate !== null) {
            // Cache the rate
            exchangeRates[cacheKey] = {
                rate: rate,
                timestamp: Date.now()
            };

            const convertedAmount = amount * rate;
            convertedInput.value = convertedAmount.toFixed(4);
        }
    }
}

// Event listeners
amountInput.addEventListener('input', convertCurrency);
baseCurrencySelect.addEventListener('change', convertCurrency);
targetCurrencySelect.addEventListener('change', convertCurrency);

// Initial conversion
convertCurrency();