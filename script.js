document.addEventListener('DOMContentLoaded', () => {
    // --- BURGER MENU ---
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav-list');
    const navLinks = document.querySelectorAll('.nav-list li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        burger.classList.toggle('toggle');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            navLinks.forEach(link => link.style.animation = '');
            burger.classList.remove('toggle');
        });
    });

    // --- MODAL WINDOWS (POP-UPS) ---
    const modalBtns = document.querySelectorAll('.btn-modal');
    const closeBtns = document.querySelectorAll('.close');
    const modals = document.querySelectorAll('.modal');

    // Відкрити модальне вікно
    modalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if(modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Заборонити прокрутку фону
            }
        });
    });

    // Закрити при кліку на хрестик
    closeBtns.forEach(span => {
        span.addEventListener('click', () => {
            span.closest('.modal').style.display = 'none';
            document.body.style.overflow = 'auto'; // Повернути прокрутку
        });
    });

    // Закрити при кліку за межами вікна
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
