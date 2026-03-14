/**
 * i18n Library with Manual Language Override
 */

const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'user_lang';

let currentMessages = null;

/**
 * Initializes the localization system.
 * Checks for saved language preference or uses default.
 */
async function initLocalization() {
    setupLanguageSelector();

    const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    await loadLanguage(savedLang);
}

/**
 * Loads the specific language messages JSON.
 * @param {string} lang - Language code (en, fr, de)
 */
async function loadLanguage(lang) {
    try {
        // Use local JSON files instead of _locales to avoid restriction issues
        let url;
        if (chrome.runtime && chrome.runtime.getURL) {
            url = chrome.runtime.getURL(`locales/${lang}.json`);
        } else {
            // Fallback for non-extension context if ever needed
            url = `locales/${lang}.json`;
        }

        const response = await fetch(url);
        currentMessages = await response.json();

        // Save preference
        localStorage.setItem(STORAGE_KEY, lang);

        // Update DOM
        applyTranslations();
        updateSelectorUI(lang);

        // Update document lang attribute
        document.documentElement.lang = lang;

    } catch (error) {
        console.error(`Failed to load language: ${lang}`, error);
        // Fallback to chrome.i18n approach if fetch fails (e.g. in content script without access)
        applyFallbackTranslations();
    }
}

/**
 * Applies translations to the DOM using the loaded messages.
 */
function applyTranslations() {
    if (!currentMessages) return;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (currentMessages[key]) {
            element.textContent = currentMessages[key].message;
        }
    });

    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (currentMessages[key]) {
            input.placeholder = currentMessages[key].message;
        }
    });
}

/**
 * Fallback implementation using chrome.i18n.getMessage
 * Used when manual loading fails or for content scripts if needed.
 */
function applyFallbackTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const message = chrome.i18n.getMessage(key);
        if (message) element.textContent = message;
    });

    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        const message = chrome.i18n.getMessage(key);
        if (message) input.placeholder = message;
    });
}

/**
 * Sets up the language selector event listeners.
 * Handles the custom dropdown interaction.
 */
// Set up listeners for the profile-based language list
function setupLanguageSelector() {
    const langItems = document.querySelectorAll('.lang-item');

    langItems.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Use currentTarget to ensure we get the button, not a child
            const lang = e.currentTarget.getAttribute('data-lang');
            if (lang) {
                loadLanguage(lang);
            }
        });
    });
}

// Update the UI (checkmark and active state)
function updateSelectorUI(lang) {
    const langItems = document.querySelectorAll('.lang-item');

    langItems.forEach(btn => {
        const itemLang = btn.getAttribute('data-lang');
        const checkIcon = btn.querySelector('.check-icon');

        if (itemLang === lang) {
            btn.classList.add('active');
            if (checkIcon) checkIcon.classList.remove('hidden');
        } else {
            btn.classList.remove('active');
            if (checkIcon) checkIcon.classList.add('hidden');
        }
    });

    // Also update any other UI elements if needed, but for now it's just the list.
}

// Backward compatibility alias, now async but triggers the flow
function localizeHtmlPage() {
    initLocalization();
}

// Expose globals
if (typeof window !== 'undefined') {
    window.localizeHtmlPage = localizeHtmlPage;
    window.setLanguage = loadLanguage;
    window.initLocalization = initLocalization;
}
