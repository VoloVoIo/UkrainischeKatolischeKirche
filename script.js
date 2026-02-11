document.addEventListener('DOMContentLoaded', () => {
    
    // --- SORTING NEWS (AUTO-SORT) ---
    // Автоматичне сортування новин за датою (від нових до старих)
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
        const cards = Array.from(newsGrid.children);
        
        cards.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            return dateB - dateA; // Спадаючий порядок (новіші перші)
        });

        // Очищаємо контейнер і додаємо відсортовані картки
        newsGrid.innerHTML = '';
        cards.forEach(card => newsGrid.appendChild(card));
    }

    // --- NAVIGATION & BURGER ---
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('header');

    // Toggle Menu
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        
        // Анімація ліній бургера
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

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            burger.children[0].style.transform = 'none';
            burger.children[1].style.opacity = '1';
            burger.children[2].style.transform = 'none';
        });
    });

    // Header Background on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- SCROLL REVEAL ANIMATION ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Анімуємо лише раз
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Спрацьовує, коли видно 15% елемента
        rootMargin: "0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- MODAL WINDOWS ---
    const modalBtns = document.querySelectorAll('.btn-modal');
    const closeBtns = document.querySelectorAll('.close');

    modalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if(modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Блокуємо скрол фону
            }
        });
    });

    closeBtns.forEach(span => {
        span.addEventListener('click', () => {
            span.closest('.modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Закриття при кліку за межами модального вікна
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // --- LIGHTBOX (IMAGE ZOOM WITH NAVIGATION) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // Select all images that are meant to be in gallery
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    let currentGalleryImages = []; // Масив фото з поточного відкритого альбому
    let currentIndex = 0; // Індекс поточного фото

    // Функція оновлення зображення в лайтбоксі
    function updateLightboxImage() {
        if (currentGalleryImages.length > 0) {
            lightboxImg.src = currentGalleryImages[currentIndex].src;
        }
    }

    // Відкриття лайтбоксу при кліку на фото
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Щоб не спрацьовували інші кліки
            lightbox.style.display = 'block';
            
            // 1. Знаходимо батьківський контейнер галереї (щоб гортати тільки цей альбом)
            const parentGallery = this.closest('.gallery-grid');
            
            if (parentGallery) {
                // 2. Збираємо всі фото тільки з цього блоку
                currentGalleryImages = Array.from(parentGallery.querySelectorAll('.gallery-item'));
                // 3. Знаходимо індекс натиснутого фото
                currentIndex = currentGalleryImages.indexOf(this);
            } else {
                // Якщо раптом фото не в гріді, показуємо тільки його
                currentGalleryImages = [this];
                currentIndex = 0;
            }

            updateLightboxImage();
        });
    });

    // Навігація: Наступне фото
    function showNextImage() {
        currentIndex++;
        if (currentIndex >= currentGalleryImages.length) {
            currentIndex = 0; // Зациклюємо по колу
        }
        updateLightboxImage();
    }

    // Навігація: Попереднє фото
    function showPrevImage() {
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = currentGalleryImages.length - 1; // Йдемо в кінець
        }
        updateLightboxImage();
    }

    // Події кнопок
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });

    // Керування клавіатурою (стрілки)
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'Escape') lightbox.style.display = 'none';
        }
    });

    // Закриття лайтбоксу
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });
    }

    // Закриття при кліку на фон (але не на картинку чи стрілки)
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });
    }

});
