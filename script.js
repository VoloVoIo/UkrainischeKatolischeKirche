document.addEventListener('DOMContentLoaded', () => {

    /* НАЛАШТУВАННЯ GOOGLE ТАБЛИЦІ
       Вставлено твоє посилання на CSV.
    */
    const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1yNB7bk-0nLbM5Mice_LAbKgksm4PkAYiVgOHNlmBqUaYYbvsolEC7V2wE5raFVb9ZlmWCFSHBu67/pub?output=csv";

    // --- ФУНКЦІЇ ДЛЯ РОБОТИ З НОВИНАМИ ---

    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('uk-UA', options);
    }

    function createCardHTML(item, index) {
        // Визначаємо, чи показувати картинку чи іконку
        let imgContainerHTML = '';
        // Перевіряємо чи є посилання на картинку
        if (item.image_url && item.image_url.trim() !== "") {
            imgContainerHTML = `
                <div class="card-img-container">
                    <img src="${item.image_url}" alt="${item.title}" class="card-photo">
                </div>`;
        } else {
            // Якщо картинки немає, використовуємо іконку
            const bgClass = item.modal_bg_color || 'icon-bg-blue';
            const iconClass = item.icon_class || 'fas fa-newspaper'; // стандартна іконка якщо нічого не вказано
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
        // Сортування: найновіші перші (за датою)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        const homeGrid = document.getElementById('news-grid-home');
        const archiveGrid = document.getElementById('news-grid-archive');

        // Якщо ми на головній сторінці - показуємо 3 останні
        if (homeGrid) {
            homeGrid.innerHTML = '';
            const latestNews = data.slice(0, 3);
            latestNews.forEach((item, index) => {
                // Важливо: передаємо оригінальний індекс з відсортованого масиву latestNews
                homeGrid.innerHTML += createCardHTML(item, index);
            });
            setupDynamicModal(latestNews);
        }

        // Якщо ми на сторінці архіву - показуємо всі
        if (archiveGrid) {
            archiveGrid.innerHTML = '';
            data.forEach((item, index) => {
                archiveGrid.innerHTML += createCardHTML(item, index);
            });
            setupDynamicModal(data);
        }
        
        // Перезапускаємо анімацію появи для нових елементів
        observeRevealElements();
    }

    function setupDynamicModal(data) {
        const modal = document.getElementById('modal-news-dynamic');
        if (!modal) return;

        // Використовуємо делегування подій, бо кнопки створюються динамічно
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

        // Закриття
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

    // --- CSV PARSER (Розумний парсер для таблиць з комами в тексті) ---
    function parseCSV(text) {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            // Обробка лапок
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentCell += '"'; // Подвійна лапка всередині тексту
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } 
            // Обробка коми (розділювач), якщо ми не в лапках
            else if (char === ',' && !inQuotes) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } 
            // Обробка нового рядка
            else if ((char === '\r' || char === '\n') && !inQuotes) {
                if (currentCell || currentRow.length > 0) {
                    currentRow.push(currentCell.trim());
                    if (currentRow.length > 1) rows.push(currentRow); // Ігноруємо пусті рядки
                }
                currentRow = [];
                currentCell = '';
                if (char === '\r' && nextChar === '\n') i++;
            } 
            else {
                currentCell += char;
            }
        }
        // Додаємо останній рядок
        if (currentCell || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            if (currentRow.length > 1) rows.push(currentRow);
        }

        // Перетворення масиву рядків в масив об'єктів
        const headers = rows[0]; // Перший рядок - заголовки
        const result = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const obj = {};
            // Безпечно мапимо дані, навіть якщо рядки неповні
            headers.forEach((header, index) => {
                obj[header.trim()] = row[index] || "";
            });
            result.push(obj);
        }
        return result;
    }

    // ЗАПУСК: Завантаження новин
    if (googleSheetUrl) {
        fetch(googleSheetUrl)
            .then(response => response.text())
            .then(csvText => {
                const sheetData = parseCSV(csvText);
                renderNews(sheetData);
            })
            .catch(error => {
                console.error("Помилка завантаження таблиці:", error);
                // Якщо помилка, нічого не показуємо або можна розкоментувати старі дані як резерв
            });
    }


    // --- НИЖЧЕ СТАНДАРТНИЙ КОД САЙТУ (БУРГЕР, АНІМАЦІЇ, ГАЛЕРЕЯ) ---

    // BURGER MENU
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

    // SCROLL REVEAL ANIMATION
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

    // STATIC MODAL WINDOWS (COMMUNITY)
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

    // LIGHTBOX
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
});

/* --- СТИЛІ ДЛЯ ПЕРЕМИКАЧА МОВ --- */
.language-switcher {
    display: inline-flex;
    align-items: center;
    margin-left: 20px;
}

.lang-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
    padding: 5px;
    transition: color 0.3s ease;
}

.lang-btn:hover {
    color: var(--primary-color);
}

.lang-separator {
    margin: 0 5px;
    color: #ccc;
}

/* --- ХОВАЄМО СИСТЕМНІ ЕЛЕМЕНТИ GOOGLE --- */
body {
    top: 0 !important;
}
.skiptranslate, #google_translate_element, .goog-te-spinner-pos {
    display: none !important;
}
