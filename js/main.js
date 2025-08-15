/**
 * Inicializa la animación de difuminado para el mosaico de la página de inicio.
 */
function initializeHomepage() {
    const columns = document.querySelectorAll('.mosaic-column');
    if (columns.length === 0) return;

    columns.forEach((column, colIndex) => {
        // Apply entrance animation
        column.classList.add('mosaic-entrance-animation');
        column.style.animationDelay = `${0.1 * (colIndex + 1)}s`; // Staggered entrance

        const images = column.querySelectorAll('img');
        let currentIndex = 0;

        // Initial state for domino effect
        images.forEach((img, imgIndex) => {
            img.style.transitionDelay = `${0.1 * imgIndex}s`; // Stagger images within column
        });

        // Set the first image as active initially
        images[currentIndex].classList.add('active');

        setInterval(() => {
            // Remove 'active' class from current image
            images[currentIndex].classList.remove('active');

            // Calculate index of the next image
            currentIndex = (currentIndex + 1) % images.length;

            // Add 'active' class to the new image
            images[currentIndex].classList.add('active');
        }, 4000); // Change image every 4 seconds
    });
}

/**
 * Carga la cuadrícula de modelos en las páginas men.html y women.html
 * @param {string} category - La categoría a mostrar ('men' o 'women')
 */
async function loadGridPage(category) {
    const gridContainer = document.getElementById('model-grid');
    if (!gridContainer) return;

    try {
        const response = await fetch('../models/models.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const filteredModels = data.models.filter(model => model.category === category);

        // Limpiar el loader
        gridContainer.innerHTML = '';

        filteredModels.forEach(model => {
            const card = document.createElement('a');
            card.href = `portfolio.html?id=${model.id}`;
            card.className = 'model-card';
            card.innerHTML = `
                <img src="${model.thumbnailUrl}" alt="${model.name}" loading="lazy">
                <div class="model-card-overlay">
                    <span class="model-card-name">${model.name}</span>
                    <div class="model-details">
                        ${Object.entries(model.details).map(([key, value]) => `<p>${key}: ${value}</p>`).join('')}
                    </div>
                </div>
            `;
            gridContainer.appendChild(card);
        });

    } catch (error) {
        gridContainer.innerHTML = '<p>Error loading models. Please try again later.</p>';
        console.error('Fetch error:', error);
    }
}


/**
 * Carga el perfil de un modelo individual en portfolio.html
 */
async function loadPortfolioPage() {
    console.log("loadPortfolioPage function started");
    const mainContainer = document.getElementById('portfolio-main');
    if (!mainContainer) {
        console.error("Could not find the element with id 'portfolio-main'");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('id');
    console.log("Model ID from URL:", modelId);

    if (!modelId) {
        mainContainer.innerHTML = '<h1>Model not specified.</h1>';
        return;
    }

    try {
        console.log("Fetching models.json...");
        const response = await fetch('../models/models.json');
        console.log("Fetch response status:", response.status);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        console.log("Successfully parsed models.json");

        const model = data.models.find(m => m.id === modelId);
        console.log("Found model:", model);

        if (!model) {
            mainContainer.innerHTML = '<h1>Model not found.</h1>';
            return;
        }

        document.title = `Contacto Basico - ${model.name}`;

        // Populate Model Name
        const modelNameElement = document.querySelector('.modelNameBook');
        if (modelNameElement) {
            modelNameElement.textContent = model.name;
        }

        // Populate Model Measurements
        const measurementsList = document.querySelector('.modelBookMeasurements');
        if (measurementsList) {
            measurementsList.innerHTML = ''; // Clear existing placeholders
            for (const key in model.details) {
                const measurementItem = document.createElement('div');
                measurementItem.classList.add('measurement-item');
                measurementItem.innerHTML = `
                    <span class="measurementName">${key}:</span>
                    <span class="measurements">${model.details[key]}</span>
                `;
                measurementsList.appendChild(measurementItem);
            }
        }

        // Custom Carousel Implementation
        const carouselImagesContainer = document.querySelector('.carousel-images');
        const prevButton = document.querySelector('.carousel-button.prev');
        const nextButton = document.querySelector('.carousel-button.next');
        let currentImageIndex = 0;

        if (carouselImagesContainer && model.portfolioImages && model.portfolioImages.length > 0) {
            carouselImagesContainer.innerHTML = ''; // Clear existing images

            model.portfolioImages.forEach((imageUrl, index) => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `${model.name} ${index + 1}`;
                img.classList.add('carousel-image');
                if (index === 0) {
                    img.classList.add('active');
                }
                carouselImagesContainer.appendChild(img);
            });

            const images = carouselImagesContainer.querySelectorAll('.carousel-image');

            const showImage = (index) => {
                images.forEach((img, i) => {
                    img.classList.remove('active', 'prev-active', 'next-active');
                    if (i === index) {
                        img.classList.add('active');
                    } else if (i === (index - 1 + images.length) % images.length) {
                        img.classList.add('prev-active');
                    } else if (i === (index + 1) % images.length) {
                        img.classList.add('next-active');
                    }
                });
            };

            prevButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                showImage(currentImageIndex);
            });

            nextButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % images.length;
                showImage(currentImageIndex);
            });

            showImage(currentImageIndex); // Initialize carousel display

        } else if (carouselImagesContainer) {
            carouselImagesContainer.innerHTML = '<p>No portfolio images available.</p>';
        }

        console.log("Portfolio page built successfully");

    } catch (error) {
        mainContainer.innerHTML = '<h1>Error loading portfolio. Please try again later.</h1>';
        console.error('Fetch error:', error);
    }
}


let translations = {};

async function loadTranslations() {
    try {
        const response = await fetch('../translations.json');
        if (!response.ok) throw new Error('Network response was not ok');
        translations = await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function setLanguage(lang) {
    document.documentElement.lang = lang;
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Handle dynamic content translations
    document.querySelectorAll('[data-translate-title-en]').forEach(el => {
        el.innerText = lang === 'en' ? el.getAttribute('data-translate-title-en') : el.getAttribute('data-translate-title-es');
    });
    document.querySelectorAll('[data-translate-date-en]').forEach(el => {
        el.innerText = lang === 'en' ? el.getAttribute('data-translate-date-en') : el.getAttribute('data-translate-date-es');
    });
    document.querySelectorAll('[data-translate-description-en]').forEach(el => {
        el.innerText = lang === 'en' ? el.getAttribute('data-translate-description-en') : el.getAttribute('data-translate-description-es');
    });

    if (lang === 'en') {
        document.getElementById('lang-en').classList.add('active');
        document.getElementById('lang-es').classList.remove('active');
    } else {
        document.getElementById('lang-es').classList.add('active');
        document.getElementById('lang-en').classList.remove('active');
    }
}

async function loadEventsPage() {
    const eventsContainer = document.querySelector('.events-container');
    if (!eventsContainer) return;

    try {
        const response = await fetch('../data/events.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const events = await response.json();

        eventsContainer.innerHTML = ''; // Clear loader or existing content

        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <img src="${event.image}" alt="${event.title_en}" loading="lazy">
                <h2 data-translate-title-en="${event.title_en}" data-translate-title-es="${event.title_es}">${event.title_en}</h2>
                <p class="event-date" data-translate-date-en="${event.date_en}" data-translate-date-es="${event.date_es}">${event.date_en}</p>
                <p data-translate-description-en="${event.description_en}" data-translate-description-es="${event.description_es}">${event.description_en}</p>
            `;
            eventsContainer.appendChild(eventElement);
        });
        // Re-apply translations after loading dynamic content
        setLanguage(document.documentElement.lang);

    } catch (error) {
        eventsContainer.innerHTML = '<p>Error loading events. Please try again later.</p>';
        console.error('Fetch error:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadTranslations();
    const initialLang = document.documentElement.lang || 'es';
    setLanguage(initialLang);

    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('lang-es').addEventListener('click', () => setLanguage('es'));

    const page = window.location.pathname.split("/").pop();

    if (page === 'men.html') {
        loadGridPage('men');
    } else if (page === 'women.html') {
        loadGridPage('women');
    } else if (page === 'portfolio.html') {
        loadPortfolioPage();
    } else if (page === 'events.html') { // New condition for events page
        loadEventsPage();
    }

    /* --- LOGICA PARA OCULTAR HEADER EN SCROLL --- */
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', function() {
        if (!header) return; // No ejecutar en páginas sin el header fijo (como la homepage)

        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Scroll hacia abajo
            header.classList.add('header-hidden');
        } else {
            // Scroll hacia arriba
            header.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
});