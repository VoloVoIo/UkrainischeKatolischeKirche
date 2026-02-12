document.addEventListener('DOMContentLoaded', () => {

    /*
    -----------------------------------------------------------------------
    ЯК ПІДКЛЮЧИТИ GOOGLE ТАБЛИЦЮ В МАЙБУТНЬОМУ:
    
    1. Створіть Google Таблицю з такими заголовками (перший рядок):
       date | title | short_text | full_text | image_url | icon_class | modal_bg_color
       
       Опис колонок:
       - date: формат РРРР-ММ-ДД (наприклад, 2026-02-08)
       - title: Заголовок новини
       - short_text: Короткий опис для картки
       - full_text: Повний HTML текст для модального вікна (можна з тегами <p>, <ul>, <strong>)
       - image_url: Посилання на фото (наприклад, img/photo.jpg) або залиште пустим, якщо є іконка
       - icon_class: Клас іконки (наприклад, fas fa-laptop-code), якщо немає фото
       - modal_bg_color: Колір фону для іконки (наприклад, icon-bg-orange), якщо немає фото

    2. Натисніть "Файл" -> "Поділитися" -> "Опублікувати в інтернеті".
    3. Виберіть "Весь документ" та формат "Кома-розділювач (CSV)".
    4. Скопіюйте отримане посилання і вставте його нижче у змінну googleSheetUrl.
    -----------------------------------------------------------------------
    */
    
    const googleSheetUrl = ""; // Вставте сюди посилання CSV у майбутньому

    // ВАШІ ПОТОЧНІ НОВИНИ (ХАРДКОД, ПРАЦЮЄ ЯКЩО НЕМАЄ ТАБЛИЦІ)
    const localNewsData = [
        {
            date: "2026-02-08",
            title: "Храмове свято та візит Владики",
            short_text: "Наша парафія урочисто відсвяткувала свій 80-річний ювілей. Дізнайтеся, як пройшло храмове свято та візит почесних гостей.",
            full_text: `
                <p><strong>Дорогі парафіяни та гості!</strong></p>
                <p>8 лютого наша громада урочисто відзначила визначну дату — <strong>80-річчя заснування парафії бл. свщмч. Петра Вергуна.</strong> Щиро дякуємо усім, хто розділив з нами радість молитви в цей історичний день.</p>
                <div class="info-box">
                    <h4><i class="far fa-calendar-check"></i> Свято відбулося 8 лютого</h4>
                    <p>Урочиста <strong>Архієрейська Божественна Літургія</strong> стала центром нашого ювілею.</p>
                </div>
                <p>Богослужіння очолили почесні гості:</p>
                <ul class="check-list">
                    <li>Владика Богдан Дзюрах (Апостольський екзарх)</li>
                    <li>Єпископ Бертрам Майєр (Єпископ Аугсбурзький)</li>
                </ul>`,
            image_url: "img/80Jahr.jpg",
            icon_class: "",
            modal_bg_color: ""
        },
        {
            date: "2026-02-12",
            title: "Запуск веб-сайту парафії",
            short_text: "Цей сайт був створений учасником молодіжної спільноти як подарунок для всієї нашої парафії.",
            full_text: `
                <p>В честь 80-річчя української церковної громади в Аугсбурзі ми запустили офіційний веб-сайт.</p>
                <p>Цей ресурс був створений учасником молодіжної спільноти як щирий подарунок для всієї парафії, щоб кожен міг легко знайти потрібну інформацію.</p>
                <h4>Що тепер доступно онлайн?</h4>
                <ul class="check-list">
                    <li>Актуальний розклад богослужінь.</li>
                    <li>Останні новини та анонси подій.</li>
                    <li>Інформація про катехизацію, молодь та волонтерство.</li>
                    <li>Контакти та мапа доїзду.</li>
                </ul>`,
            image_url: "",
            icon_class: "fas fa-laptop-code",
            modal_bg_color: "icon-bg-orange"
        },
        {
            date: "2026-02-02",
            title: "Свято Стрітення ГНІХ",
            short_text: "Бажаємо щоб світло Христове світило і зігрівало усіх, особливо там де зараз найхолодніше і найтемніше!",
            full_text: `
                <p><strong>Христос посеред нас! І є, і буде!</strong></p>
                <p>Сьогодні ми святкуємо Стрітення Господа нашого Ісуса Христа. Це свято зустрічі людини з Богом, Старого Завіту з Новим. У цей день Пречиста Діва Марія та Йосиф принесли маленького Ісуса до Єрусалимського храму, де їх зустрів праведний старець Симеон.</p>
                <div class="info-box">
                    <p>Бажаємо, щоб світло Христове світило і зігрівало усіх, особливо там, де зараз найхолодніше і найтемніше!</p>
                </div>
                <p>За традицією, у цей день в церкві освячують свічки — "громиці". Нехай ця освячена свічка стане символом світла нашої віри, яке розганяє темряву гріха та зневіри.</p>`,
            image_url: "img/stritenya.jpg",
            icon_class: "",
            modal_bg_color: ""
        }
    ];

    // --- ФУНКЦІЇ ДЛЯ РОБОТИ З НОВИНАМИ ---

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('uk-UA', options);
    }

    function createCardHTML(item, index) {
        // Визначаємо, чи показувати картинку чи іконку
        let imgContainerHTML = '';
        if (item.image_url && item.image_url.trim() !== "") {
            imgContainerHTML = `
                <div class="card-img-container">
                    <img src="${item.image_url}" alt="${item.title}" class="card-photo">
                </div>`;
        } else {
            const bgClass = item.modal_bg_color || 'icon-bg-blue';
            imgContainerHTML = `
                <div class="card-img-container ${bgClass}">
                    <i class="${item.icon_class} card-placeholder-icon"></i>
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
        // Сортуємо: найновіші перші
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        const homeGrid = document.getElementById('news-grid-home');
        const archiveGrid = document.getElementById('news-grid-archive');

        // Якщо ми на головній сторінці
        if (homeGrid) {
            homeGrid.innerHTML = '';
            // Беремо тільки перші 3 новини
            const latestNews = data.slice(0, 3);
            latestNews.forEach((item, index) => {
                homeGrid.innerHTML += createCardHTML(item, index);
            });
            setupDynamicModal(latestNews);
        }

        // Якщо ми на сторінці архіву
        if (archiveGrid) {
            archiveGrid.innerHTML = '';
            // Беремо всі новини
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

        const btns = document.querySelectorAll('.btn-dynamic-modal');
        const closeBtn = modal.querySelector('.close');
        
        // Елементи всередині модалки
        const mTitle = document.getElementById('dynamic-news-title');
        const mImgContainer = document.getElementById('dynamic-news-img-container');
        const mDate = document.getElementById('dynamic-news-date');
        const mContent = document.getElementById('dynamic-news-content');

        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Знаходимо індекс новини з батьківського елемента article
                const card = btn.closest('.card');
                const index = card.getAttribute('data-index'); // Це індекс у відсортованому масиві data, що ми передали
                
                // Важливо: оскільки ми передали відрізаний масив (latestNews) на головній, індекс буде 0,1,2
                // Тому ми беремо об'єкт з data по цьому індексу
                const item = data[index]; 

                if (item) {
                    mTitle.textContent = item.title;
                    mDate.textContent = formatDate(item.date);
                    mContent.innerHTML = item.full_text;

                    // Картинка або іконка в модалці
                    if (item.image_url && item.image_url.trim() !== "") {
                        mImgContainer.innerHTML = `<img src="${item.image_url}" alt="${item.title}" class="modal-hero-img">`;
                    } else {
                        // Якщо іконка - робимо гарний фон замість фото
                        const bgClass = item.modal_bg_color || 'icon-bg-blue';
                        mImgContainer.innerHTML = `
                            <div style="height: 200px; display: flex; align-items: center; justify-content: center;" class="${bgClass}">
                                <i class="${item.icon_class}" style="font-size: 5rem; color: var(--primary-color);"></i>
                            </div>`;
                    }

                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Закриття модалки
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

    // Parse CSV helper
    function csvToJSON(csv) {
        const lines = csv.split("\n");
        const result = [];
        const headers = lines[0].split(",").map(h => h.trim());

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const obj = {};
            const currentline = lines[i].split(","); // Простий спліт, краще використовувати бібліотеку для складних CSV
            
            // Якщо CSV складний (з комами в тексті), це простий парсер може зламатися.
            // Для надійності краще використовувати бібліотеку типу PapaParse, але поки простий варіант:
            headers.forEach((header, j) => {
                obj[header] = currentline[j] ? currentline[j].trim() : "";
            });
            result.push(obj);
        }
        return result;
    }

    // INIT NEWS
    if (googleSheetUrl) {
        fetch(googleSheetUrl)
            .then(response => response.text())
            .then(csvText => {
                const sheetData = csvToJSON(csvText);
                renderNews(sheetData);
            })
            .catch(error => {
                console.error("Error fetching Google Sheet, using local data:", error);
                renderNews(localNewsData);
            });
    } else {
        renderNews(localNewsData);
    }


    // --- NAVIGATION & BURGER (Залишив як було) ---
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
                burger.children[0].style.transform = 'none';
                burger.children[1].style.opacity = '1';
                burger.children[2].style.transform = 'none';
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

    // --- SCROLL REVEAL ANIMATION (Виніс в функцію для повторного виклику) ---
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
    
    // Запускаємо анімацію при завантаженні
    observeRevealElements();

    // --- STATIC MODAL WINDOWS (Для Громади) ---
    const modalBtns = document.querySelectorAll('.btn-modal');
    const closeBtns = document.querySelectorAll('.close:not(.dynamic-close)'); // виключаємо динамічне закриття, воно оброблено вище

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

    // --- LIGHTBOX ---
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
