/**
 * Inicializa la animación de difuminado para el mosaico de la página de inicio.
 */
function initializeHomepage() {
    const columns = document.querySelectorAll('.mosaic-column');
    if (columns.length === 0) return;

    columns.forEach(column => {
        const images = column.querySelectorAll('img');
        let currentIndex = 0;

        setInterval(() => {
            // Elimina la clase 'active' de la imagen actual
            images[currentIndex].classList.remove('active');

            // Calcula el índice de la siguiente imagen
            currentIndex = (currentIndex + 1) % images.length;

            // Añade la clase 'active' a la nueva imagen
            images[currentIndex].classList.add('active');
        }, 4000); // Cambia la imagen cada 4 segundos
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
        console.log("Clearing loader...");
        mainContainer.innerHTML = ''; // Clear loader
        console.log("Building page structure...");

        // --- Build Page Structure ---

        // 1. Model Name
        const nameWrapper = document.createElement('div');
        nameWrapper.className = 'portfolio-name-wrapper';
        nameWrapper.innerHTML = `<h1 class="portfolio-name">${model.name}</h1>`;
        mainContainer.appendChild(nameWrapper);

        // 2. Sub Navigation
        const subNav = document.createElement('nav');
        subNav.className = 'portfolio-sub-nav';
        const sections = {
            'PORTFOLIO': model.portfolioImages,
            'POLAROIDS': model.polaroidImages,
            'VIDEO': model.videos,
            'PASARELAS': model.runways
        };

        let hasContent = false;
        for (const sectionName in sections) {
            if (sections[sectionName] && sections[sectionName].length > 0) {
                hasContent = true;
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = sectionName;
                link.dataset.section = sectionName.toLowerCase();
                subNav.appendChild(link);
            }
        }
        
        if (hasContent) {
            mainContainer.appendChild(subNav);
        }

        // 3. Content Sections
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'portfolio-content';
        mainContainer.appendChild(contentWrapper);

        for (const sectionName in sections) {
            if (sections[sectionName] && sections[sectionName].length > 0) {
                const sectionDiv = document.createElement('div');
                sectionDiv.id = `section-${sectionName.toLowerCase()}`;
                sectionDiv.className = 'portfolio-content-section';
                
                let gridClass = 'portfolio-grid';
                if (sectionName === 'VIDEO') {
                    gridClass = 'video-grid';
                }

                const grid = document.createElement('div');
                grid.className = gridClass;

                if (sectionName === 'VIDEO') {
                    sections[sectionName].forEach(videoUrl => {
                        const videoContainer = document.createElement('div');
                        videoContainer.className = 'video-container';
                        videoContainer.innerHTML = `<iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                        grid.appendChild(videoContainer);
                    });
                } else {
                    sections[sectionName].forEach(imageUrl => {
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = `${model.name} - ${sectionName}`;
                        grid.appendChild(img);
                    });
                }
                sectionDiv.appendChild(grid);
                contentWrapper.appendChild(sectionDiv);
            }
        }

        // --- Interactivity ---
        const navLinks = subNav.querySelectorAll('a');
        const contentSections = contentWrapper.querySelectorAll('.portfolio-content-section');

        if (navLinks.length > 0) {
            // Set initial state
            navLinks[0].classList.add('active');
            contentSections[0].classList.add('active');

            // Add click listeners
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Deactivate all
                    navLinks.forEach(l => l.classList.remove('active'));
                    contentSections.forEach(s => s.classList.remove('active'));

                    // Activate clicked
                    link.classList.add('active');
                    const sectionId = `section-${link.dataset.section}`;
                    document.getElementById(sectionId).classList.add('active');
                });
            });
        }
        console.log("Portfolio page built successfully");

    } catch (error) {
        mainContainer.innerHTML = '<h1>Error loading portfolio.</h1>';
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
    } else if (page === 'index.html' || page === '') {
        initializeHomepage();
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