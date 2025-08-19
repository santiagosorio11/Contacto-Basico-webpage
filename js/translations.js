// Función para detectar el idioma del navegador
function detectLanguage() {
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage) {
        return savedLanguage;
    }

    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('es') ? 'es' : 'en';
}

// Función para cargar las traducciones
async function loadTranslations() {
    try {
        const response = await fetch('../translations.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// Función para aplicar las traducciones
function applyTranslations(translations, language) {
    if (!translations || !translations[language]) return;

    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language][key]) {
            if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                element.placeholder = translations[language][key];
            } else {
                element.textContent = translations[language][key];
            }
        }
    });

    // Actualizar los botones de idioma
    const enButton = document.getElementById('lang-en');
    const esButton = document.getElementById('lang-es');
    if (enButton && esButton) {
        enButton.classList.toggle('active', language === 'en');
        esButton.classList.toggle('active', language === 'es');
    }

    // Guardar la preferencia del usuario
    localStorage.setItem('preferred_language', language);
}

// Función para inicializar el sistema de traducción
async function initializeTranslation() {
    const translations = await loadTranslations();
    if (!translations) return;

    const currentLang = detectLanguage();
    applyTranslations(translations, currentLang);

    // Event listeners para los botones de idioma
    const enButton = document.getElementById('lang-en');
    const esButton = document.getElementById('lang-es');

    if (enButton && esButton) {
        enButton.addEventListener('click', () => {
            applyTranslations(translations, 'en');
            document.documentElement.lang = 'en';
        });

        esButton.addEventListener('click', () => {
            applyTranslations(translations, 'es');
            document.documentElement.lang = 'es';
        });
    }
}

// Asegurarse de que las traducciones se apliquen después de cargar el DOM
document.addEventListener('DOMContentLoaded', initializeTranslation);
