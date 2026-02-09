document.addEventListener('DOMContentLoaded', () => {
    
    // --- NAVIGATION & BURGER ---
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('header');

    // Відкриття/Закриття меню
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        
        // Анімація хрестика на бургері
        if(burger.classList.contains('toggle')) {
            burger.children[0].style.transform = 'rotate(-45deg) translate(-5px, 8px)';
            burger.children[1].style.opacity = '0';
            burger.children[2].style.transform = 'rotate(45deg) translate(-5px, -8px)';
        } else {
            burger.children[0].style.transform = 'none';
            burger.children[1].style.opacity = '1';
            burger.children[2].style.transform = 'none';
        }
    });

    // Закриття меню при кліку на посилання
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            // Скидання анімації бургера
            burger.children[0].style.transform = 'none';
            burger.children[1].style.opacity = '1';
            burger.children[2].style.transform = 'none';
        });
    });

    // Зміна фону хедера при скролі
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- ANIMATION ON SCROLL (Reveal) ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1, 
        rootMargin: "0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- MODAL WINDOWS (Smooth Zoom) ---
    const modalBtns = document.querySelectorAll('.btn-modal');
    const closeBtns = document.querySelectorAll('.close');
    const modals = document.querySelectorAll('.modal');

    // Функція відкриття
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.style.display = 'flex'; // Спочатку робимо блок видимим для розмітки
            // Невелика затримка, щоб CSS встиг зреагувати на додавання класу active (для transition)
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            document.body.style.overflow = 'hidden'; // Блокуємо скрол сторінки
        }
    }

    // Функція закриття
    function closeModal(modal) {
        modal.classList.remove('active'); // Забираємо клас, запускається анімація зменшення/зникнення
        
        // Чекаємо завершення анімації (0.4s у CSS), потім ховаємо display
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 400); 
    }

    modalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    closeBtns.forEach(span => {
        span.addEventListener('click', () => {
            closeModal(span.closest('.modal'));
        });
    });

    // Закриття при кліку на фон
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
});
