document.addEventListener('DOMContentLoaded', () => {

    /* НАЛАШТУВАННЯ GOOGLE ТАБЛИЦІ */
    const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1yNB7bk-0nLbM5Mice_LAbKgksm4PkAYiVgOHNlmBqUaYYbvsolEC7V2wE5raFVb9ZlmWCFSHBu67/pub?output=csv";

    // --- ФУНКЦІЇ ДЛЯ РОБОТИ З НОВИНАМИ ---

    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('uk-UA', options);
    }

    function createCardHTML(item, index) {
        let imgContainerHTML = '';
        if (item.image_url && item.image_url.trim() !== "") {
            imgContainerHTML = `
                <div class="card-img-container">
                    <img src="${item.image_url}" alt="${item.title}" class="card-photo">
                </div>`;
        } else {
            const bgClass = item.modal_bg_color || 'icon-bg-blue';
            const iconClass = item.icon_class || 'fas fa-newspaper'; 
            imgContainerHTML = `
                <div class="card-img-container ${bgClass}">
                    <i class="${iconClass} card-placeholder-icon"></i>
                </div>`;
        }

        return `
            <article class="card reveal-up" data-index="${index}">
                ${imgContainerHTML}
                <div class="card-content">
                    <span class="news-date"><i class="far fa-calendar-alt"></i> ${formatDate(item.date)}</span>
                    <h3>${item.title}</h3>
                    <p>${item.short_text}</p>
                    <button class="read-more btn-dynamic-modal">Читати далі <i class="fas fa-arrow-right"></i></button>
                </div>
            </article>
        `;
    }

    function renderNews(data) {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        const homeGrid = document.getElementById('news-grid-home');
        const archiveGrid = document.getElementById('news-grid-archive');

        if (homeGrid) {
            homeGrid.innerHTML = '';
            const latestNews = data.slice(0, 3);
            latestNews.forEach((item, index) => {
                homeGrid.innerHTML += createCardHTML(item, index);
            });
            setupDynamicModal(latestNews);
        }

        if (archiveGrid) {
            archiveGrid.innerHTML = '';
            data.forEach((item, index) => {
                archiveGrid.innerHTML += createCardHTML(item, index);
            });
            setupDynamicModal(data);
        }
        
        observeRevealElements();
    }

    function setupDynamicModal(data) {
        const modal = document.getElementById('modal-news-dynamic');
        if (!modal) return;

        document.body.addEventListener('click', function(e) {
            if (e.target.closest('.btn-dynamic-modal')) {
                e.preventDefault();
                const btn = e.target.closest('.btn-dynamic-modal');
                const card = btn.closest('.card');
                const index = card.getAttribute('data-index');
                const item = data[index];

                if (item) {
                    const mTitle = document.getElementById('dynamic-news-title');
                    const mImgContainer = document.getElementById('dynamic-news-img-container');
                    const mDate = document.getElementById('dynamic-news-date');
                    const mContent = document.getElementById('dynamic-news-content');

                    mTitle.textContent = item.title;
                    mDate.textContent = formatDate(item.date);
                    mContent.innerHTML = item.full_text;

                    if (item.image_url && item.image_url.trim() !== "") {
                        mImgContainer.innerHTML = `<img src="${item.image_url}" alt="${item.title}" class="modal-hero-img">`;
                    } else {
                        const bgClass = item.modal_bg_color || 'icon-bg-blue';
                        const iconClass = item.icon_class || 'fas fa-newspaper';
                        mImgContainer.innerHTML = `
                            <div style="height: 200px; display: flex; align-items: center; justify-content: center;" class="${bgClass}">
                                <i class="${iconClass}" style="font-size: 5rem; color: var(--primary-color);"></i>
                            </div>`;
                    }

                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        const closeBtn = modal.querySelector('.close');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- CSV PARSER ---
    function parseCSV(text) {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentCell += '"'; 
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } 
            else if (char === ',' && !inQuotes) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } 
            else if ((char === '\r' || char === '\n') && !inQuotes) {
                if (currentCell || currentRow.length > 0) {
                    currentRow.push(currentCell.trim());
                    if (currentRow.length > 1) rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
                if (char === '\r' && nextChar === '\n') i++;
            } 
            else {
                currentCell += char;
            }
        }
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            if (currentRow.length > 1) rows.push(currentRow);
        }

        const headers = rows[0]; 
        const result = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const obj = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = row[index] || "";
            });
            result.push(obj);
        }
        return result;
    }

    if (googleSheetUrl) {
        fetch(googleSheetUrl)
            .then(response => response.text())
            .then(csvText => {
                const sheetData = parseCSV(csvText);
                renderNews(sheetData);
            })
            .catch(error => {
                console.error("Помилка завантаження таблиці:", error);
            });
    }


    // --- STANDARD SITE CODE ---

    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('header');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
            
            if(burger.classList.contains('toggle')) {
                burger.children[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                burger.children[1].style.opacity = '0';
                burger.children[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                burger.children[0].style.transform = 'none';
                burger.children[1].style.opacity = '1';
                burger.children[2].style.transform = 'none';
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(nav.classList.contains('nav-active')){
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                if(burger) {
                    burger.children[0].style.transform = 'none';
                    burger.children[1].style.opacity = '1';
                    burger.children[2].style.transform = 'none';
                }
            }
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    function observeRevealElements() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); 
                }
            });
        }, {
            root: null,
            threshold: 0.15, 
            rootMargin: "0px"
        });
        revealElements.forEach(el => revealObserver.observe(el));
    }
    observeRevealElements();

    const modalBtns = document.querySelectorAll('.btn-modal');
    const closeBtns = document.querySelectorAll('.close:not(.dynamic-close)');

    modalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if(modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    closeBtns.forEach(span => {
        span.addEventListener('click', () => {
            const modal = span.closest('.modal');
            if(modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    let currentGalleryImages = []; 
    let currentIndex = 0; 

    function updateLightboxImage() {
        if (currentGalleryImages.length > 0) {
            lightboxImg.src = currentGalleryImages[currentIndex].src;
        }
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            lightbox.style.display = 'block';
            const parentGallery = this.closest('.gallery-grid');
            if (parentGallery) {
                currentGalleryImages = Array.from(parentGallery.querySelectorAll('.gallery-item'));
                currentIndex = currentGalleryImages.indexOf(this);
            } else {
                currentGalleryImages = [this];
                currentIndex = 0;
            }
            updateLightboxImage();
        });
    });

    function showNextImage() {
        currentIndex++;
        if (currentIndex >= currentGalleryImages.length) currentIndex = 0;
        updateLightboxImage();
    }

    function showPrevImage() {
        currentIndex--;
        if (currentIndex < 0) currentIndex = currentGalleryImages.length - 1;
        updateLightboxImage();
    }

    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'Escape') lightbox.style.display = 'none';
        }
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }

    // Initialize Banner Killer immediately
    forceRemoveGoogleBanner();
});

/* --- LANGUAGE SWITCHER LOGIC (ВИПРАВЛЕНО 1 КЛІК) --- */
function changeLanguage(lang) {
    // 1. Встановлення або видалення cookies
    if (lang === 'uk') {
        // Видаляємо cookies для повернення до оригіналу (всі варіанти шляхів)
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    } else {
        // Встановлюємо німецьку
        document.cookie = "googtrans=/uk/de; path=/; domain=" + window.location.hostname;
        document.cookie = "googtrans=/uk/de; path=/";
    }

    // 2. МИТТЄВЕ візуальне оновлення (не чекаючи перезавантаження)
    updateActiveLangBtn(lang);
    const isGerman = (lang === 'de');
    updateGreetingText(isGerman);

    // 3. Перезавантаження сторінки для застосування змін
    // Невеликий тайм-аут дає час браузеру записати кукі
    setTimeout(() => {
        window.location.reload();
    }, 100);
}

/* --- GREETING TEXT & BANNER REMOVER OBSERVER --- */
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        
        // 1. Перевірка на "Grüß Gott" та стан кнопок
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            const isTranslated = document.documentElement.classList.contains('translated-ltr');
            
            // Якщо Google ще "тримає" клас, але ми натиснули UA - ігноруємо (бо скоро буде релоад)
            // Але якщо це ініціалізація - оновлюємо.
            updateGreetingText(isTranslated);
            
            if(isTranslated) {
                updateActiveLangBtn('de');
            } else {
                // Якщо класу немає - це точно UA
                updateActiveLangBtn('uk');
            }
        }

        // 2. Видалення відступу Google
        if (document.body.style.top && document.body.style.top !== "0px") {
            document.body.style.setProperty('top', '0px', 'important');
            document.body.style.setProperty('position', 'static', 'important');
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
});

observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style']
});


function updateActiveLangBtn(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active-lang'));
    const activeBtn = document.getElementById('btn-' + lang);
    if(activeBtn) activeBtn.classList.add('active-lang');
}

function updateGreetingText(isGerman) {
    const uaText = document.querySelector('.greeting-text-ua');
    const deText = document.querySelector('.greeting-text-de');

    if (uaText && deText) {
        if (isGerman) {
            uaText.style.display = 'none';
            deText.style.display = 'inline';
        } else {
            uaText.style.display = 'inline';
            deText.style.display = 'none';
        }
    }
}

function forceRemoveGoogleBanner() {
    setInterval(() => {
        const banners = document.querySelectorAll('.goog-te-banner-frame');
        banners.forEach(banner => {
            banner.style.display = 'none';
            banner.style.height = '0';
            banner.style.visibility = 'hidden';
        });
        if(document.body.style.top !== '0px') {
             document.body.style.setProperty('top', '0px', 'important');
             document.body.style.setProperty('position', 'static', 'important');
        }
    }, 1000);
}

// Перевірка при завантаженні (Initial Check)
window.addEventListener('load', function() {
    // Перевіряємо кукі або клас
    let isGerman = document.cookie.includes('googtrans=/uk/de') || document.documentElement.classList.contains('translated-ltr');
    
    updateGreetingText(isGerman);
    if(isGerman) {
        updateActiveLangBtn('de');
    } else {
        updateActiveLangBtn('uk');
    }
    forceRemoveGoogleBanner();
});
