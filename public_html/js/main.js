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

        // Staggered interval for image changes
        setTimeout(() => {
            setInterval(() => {
                // Remove 'active' class from current image
                images[currentIndex].classList.remove('active');

                // Calculate index of the next image
                currentIndex = (currentIndex + 1) % images.length;

                // Add 'active' class to the new image
                images[currentIndex].classList.add('active');
            }, 4000); // Change image every 4 seconds
        }, colIndex * 1333); // Stagger the start of each column's interval for a more noticeable effect
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
        const [modelsResponse, translationsResponse] = await Promise.all([
            fetch('../models/models.json'),
            fetch('../translations.json')
        ]);

        if (!modelsResponse.ok || !translationsResponse.ok) 
            throw new Error('Network response was not ok');

        const [data, translations] = await Promise.all([
            modelsResponse.json(),
            translationsResponse.json()
        ]);
        
        const currentLang = localStorage.getItem('preferred_language') || detectLanguage();
        const filteredModels = data.models.filter(model => model.category === category);

        // Update page title
        const pageTitle = document.querySelector('.site-title');
        if (pageTitle) {
            pageTitle.textContent = translations[currentLang][`nav_${category}`];
        }

        // Limpiar el loader
        gridContainer.innerHTML = '';

        filteredModels.forEach(model => {
            const card = document.createElement('a');
            card.href = `portfolio.html?id=${model.id}`;
            card.className = 'model-card';

            const detailsHtml = Object.entries(model.details).map(([key, value]) => {
                const translationKey = `detail_${key.toLowerCase()}`;
                const translatedLabel = translations[currentLang][translationKey] || key;
                let displayValue = value;
                if (value.includes(' - ')) {
                    displayValue = value.split(' - ')[0].trim();
                }
                return `<p>${translatedLabel.toUpperCase()}: ${displayValue}</p>`;
            }).join('');

            card.innerHTML = `
                <div class="model-image-wrapper">
                    <img src="${model.thumbnailUrl}" alt="${model.name}" loading="lazy">
                    <div class="model-card-overlay">
                        <div class="model-details">
                            ${detailsHtml}
                        </div>
                    </div>
                </div>
                <span class="model-card-name">${model.name}</span>
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
        console.log("Fetching models.json and translations.json...");
        const [modelsResponse, translationsResponse] = await Promise.all([
            fetch('../models/models.json'),
            fetch('../translations.json')
        ]);

        if (!modelsResponse.ok || !translationsResponse.ok) {
            throw new Error('Network response was not ok');
        }
        
        const [data, translations] = await Promise.all([
            modelsResponse.json(),
            translationsResponse.json()
        ]);
        console.log("Successfully parsed models.json and translations.json");

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
            const currentLang = localStorage.getItem('preferred_language') || detectLanguage();

            for (const key in model.details) {
                const value = model.details[key];
                const measurementItem = document.createElement('div');
                measurementItem.classList.add('measurement-item');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'measurementName';
                const translationKey = `detail_${key.toLowerCase()}`;
                const translatedLabel = translations[currentLang][translationKey] || key;
                nameSpan.textContent = `${translatedLabel}: `;

                const valueSpan = document.createElement('span');
                valueSpan.className = 'measurements';

                if (value.includes(' - ')) {
                    const parts = value.split(' - ');
                    const metricValue = parts[0].trim();
                    const imperialValue = parts[1].trim();

                    measurementItem.dataset.metric = metricValue;
                    measurementItem.dataset.imperial = imperialValue;
                    measurementItem.dataset.unitSystem = 'metric'; // Start with metric
                    
                    valueSpan.textContent = metricValue;

                    measurementItem.addEventListener('click', () => {
                        const currentSystem = measurementItem.dataset.unitSystem;
                        if (currentSystem === 'metric') {
                            valueSpan.textContent = measurementItem.dataset.imperial;
                            measurementItem.dataset.unitSystem = 'imperial';
                        } else {
                            valueSpan.textContent = measurementItem.dataset.metric;
                            measurementItem.dataset.unitSystem = 'metric';
                        }
                    });
                } else {
                    valueSpan.textContent = value;
                    measurementItem.classList.add('non-convertible');
                }

                measurementItem.appendChild(nameSpan);
                measurementItem.appendChild(valueSpan);
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

        // Populate image gallery
        const galleryContainer = document.getElementById('portfolio-gallery');
        if (galleryContainer && model.portfolioImages && model.portfolioImages.length > 0) {
            galleryContainer.innerHTML = ''; // Clear existing images
            model.portfolioImages.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = model.name;
                img.loading = 'lazy';
                galleryContainer.appendChild(img);
            });
        }

        console.log("Portfolio page built successfully");

    } catch (error) {
        mainContainer.innerHTML = '<h1>Error loading portfolio. Please try again later.</h1>';
        console.error('Fetch error:', error);
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
        initializeTranslation(); // Call the function from translations.js

    } catch (error) {
        eventsContainer.innerHTML = '<p>Error loading events. Please try again later.</p>';
        console.error('Fetch error:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
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
