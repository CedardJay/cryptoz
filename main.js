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
const errorMessage = document.getElementById('error-message');


//Currency Array
const currencies = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS",
  "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR",
  "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD",
  "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU",
  "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK",
  "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG",
  "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK",
  "SGD", "SHP", "SLL", "SOS", "SRD", "STN", "SYP", "SZL", "THB", "TJS",
  "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD",
  "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF",
  "YER", "ZAR", "ZMW", "ZWL"
];

function populateCurrencies() {
  currencies.forEach(currency => {
    const option1 = document.createElement('option');
    option1.value = currency;
    option1.textContent = currency;

    const option2 = document.createElement('option');
    option2.value = currency;
    option2.textContent = currency;

    baseCurrencySelect.appendChild(option1);
    targetCurrencySelect.appendChild(option2);
  });

  // Set default values
  baseCurrencySelect.value = 'USD';
  targetCurrencySelect.value = 'EUR';
}

populateCurrencies();



// Exchange rate cache to reduce the number of api  calls
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
        errorMessage.innerHTML = "Error Fetching exchange rate. Please try again";
        convertedInput.value = '0.0000';
        //alert('Error fetching exchange rate. Please try again.');
        return null;
    }
}

// Convert currency
async function convertCurrency() {
    const baseCurrency = baseCurrencySelect.value;
    const targetCurrency = targetCurrencySelect.value;
    const amount = parseFloat(amountInput.value);
    errorMessage.innerHTML = "";
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
populateCurrencies();
convertCurrency();