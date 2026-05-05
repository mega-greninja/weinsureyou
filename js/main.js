/* ============================================
   WE INSURE YOU — Main JavaScript
   Liquid Glass Premium Theme
   ============================================ */

(function () {
    'use strict';

    const prefersReducedMotion = () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================
       PRELOADER
       ============================================ */
    const preloader = document.getElementById('preloader');

    function hidePreloader() {
        if (!preloader) return;
        preloader.classList.add('is-hidden');
        preloader.addEventListener('transitionend', () => {
            preloader.remove();
        }, { once: true });
    }

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
        setTimeout(hidePreloader, 3000);
    }

    /* ============================================
       SCROLL PROGRESS BAR
       ============================================ */
    const scrollProgressBar = document.querySelector('.scroll-progress');

    function updateScrollProgress() {
        if (!scrollProgressBar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        scrollProgressBar.style.transform = 'scaleX(' + (scrollTop / docHeight) + ')';
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    /* ============================================
       NAVBAR — scroll effects & active link
       ============================================ */
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.navbar__link:not(.navbar__link--cta)');
    const sections = document.querySelectorAll('section[id]');

    let navTicking = false;

    function onNavScroll() {
        if (navTicking) return;
        navTicking = true;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            if (navbar) {
                navbar.classList.toggle('is-scrolled', scrollY > 50);
            }

            let currentSection = '';
            sections.forEach((section) => {
                const top = section.offsetTop - 120;
                if (scrollY >= top) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSection) {
                    link.classList.add('active');
                }
            });

            navTicking = false;
        });
    }

    window.addEventListener('scroll', onNavScroll, { passive: true });

    /* ============================================
       MOBILE MENU
       ============================================ */
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function openMenu() {
        navToggle.classList.add('is-active');
        navToggle.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('is-open');
        mobileOverlay.classList.add('is-active');
        mobileOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        mobileOverlay.classList.remove('is-active');
        mobileOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMenu);
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('is-open')) {
                closeMenu();
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
            closeMenu();
            navToggle.focus();
        }
    });

    /* ============================================
       SCROLL ANIMATIONS (IntersectionObserver)
       ============================================ */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (!animatedElements.length) return;

        if (prefersReducedMotion()) {
            animatedElements.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const stagger = el.dataset.stagger;
                        const delay = stagger ? parseInt(stagger, 10) * 80 : 0;

                        setTimeout(() => {
                            el.classList.add('is-visible');
                        }, delay);

                        observer.unobserve(el);
                    }
                });
            },
            {
                threshold: 0.08,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        animatedElements.forEach((el) => observer.observe(el));
    }

    initScrollAnimations();

    /* ============================================
       COUNTER ANIMATION (Hero Stats)
       ============================================ */
    function animateCounters() {
        const counters = document.querySelectorAll('.hero__stat-number[data-target]');
        if (!counters.length) return;

        if (prefersReducedMotion()) {
            counters.forEach((counter) => {
                counter.textContent = counter.dataset.target;
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = parseInt(counter.dataset.target, 10);
                        const duration = 2000;
                        const startTime = performance.now();

                        function easeOutQuart(t) {
                            return 1 - Math.pow(1 - t, 4);
                        }

                        function updateCounter(currentTime) {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            const easedProgress = easeOutQuart(progress);
                            const current = Math.round(easedProgress * target);

                            counter.textContent = current.toLocaleString('en-IN');

                            if (progress < 1) {
                                requestAnimationFrame(updateCounter);
                            }
                        }

                        requestAnimationFrame(updateCounter);
                        observer.unobserve(counter);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach((counter) => observer.observe(counter));
    }

    animateCounters();

    /* ============================================
       HERO ORB PARALLAX (mouse-move)
       ============================================ */
    function initHeroParallax() {
        if (prefersReducedMotion()) return;

        const orbs = document.querySelectorAll('.hero__orb');
        if (!orbs.length) return;

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let animating = false;

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function updateOrbs() {
            currentX = lerp(currentX, mouseX, 0.04);
            currentY = lerp(currentY, mouseY, 0.04);

            orbs.forEach((orb, index) => {
                const factor = (index + 1) * 0.5;
                const x = currentX * factor;
                const y = currentY * factor;
                orb.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            });

            if (animating) {
                requestAnimationFrame(updateOrbs);
            }
        }

        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                animating = true;
                requestAnimationFrame(updateOrbs);
            });

            heroSection.addEventListener('mouseleave', () => {
                animating = false;
                mouseX = 0;
                mouseY = 0;
                animating = true;
                requestAnimationFrame(function resetLoop() {
                    currentX = lerp(currentX, 0, 0.06);
                    currentY = lerp(currentY, 0, 0.06);
                    orbs.forEach((orb, index) => {
                        const factor = (index + 1) * 0.5;
                        orb.style.transform = 'translate(' + (currentX * factor) + 'px, ' + (currentY * factor) + 'px)';
                    });
                    if (Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
                        requestAnimationFrame(resetLoop);
                    } else {
                        animating = false;
                        orbs.forEach((orb) => {
                            orb.style.transform = '';
                        });
                    }
                });
            });

            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
                mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            });
        }
    }

    initHeroParallax();

    /* ============================================
       3D TILT EFFECT on cards
       ============================================ */
    function initTiltEffect() {
        if (prefersReducedMotion()) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const cards = document.querySelectorAll('.tilt-card');

        cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;

                card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    initTiltEffect();

    /* ============================================
       MAGNETIC BUTTON EFFECT
       ============================================ */
    function initMagneticButtons() {
        if (prefersReducedMotion()) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const buttons = document.querySelectorAll('.btn--glow');

        buttons.forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    initMagneticButtons();

    /* ============================================
       BACK TO TOP
       ============================================ */
    const backToTop = document.getElementById('backToTop');

    function toggleBackToTop() {
        if (!backToTop) return;
        backToTop.classList.toggle('is-visible', window.scrollY > 500);
    }

    window.addEventListener('scroll', toggleBackToTop, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ============================================
       SMOOTH SCROLL for anchor links
       ============================================ */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const navHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            });

            history.pushState(null, '', targetId);
        });
    });

    /* ============================================
       CONTACT FORM
       ============================================ */
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#contactName');
            const email = contactForm.querySelector('#contactEmail');
            const type = contactForm.querySelector('#contactType');

            let valid = true;

            [name, email, type].forEach((field) => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#EF4444';
                    valid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                email.style.borderColor = '#EF4444';
                valid = false;
            }

            if (!valid) return;

            const submitBtn = contactForm.querySelector('.contact__form-submit');
            submitBtn.classList.add('is-loading');

            setTimeout(() => {
                submitBtn.classList.remove('is-loading');
                submitBtn.classList.add('is-success');

                if (formSuccess) {
                    formSuccess.classList.add('is-visible');
                }

                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.classList.remove('is-success');

                    contactForm.querySelectorAll('.contact__form-input').forEach((input) => {
                        input.style.borderColor = '';
                    });
                }, 4000);
            }, 1500);
        });

        contactForm.querySelectorAll('.contact__form-input').forEach((input) => {
            input.addEventListener('input', () => {
                input.style.borderColor = '';
            });
        });
    }

    /* ============================================
       PARTNERS MARQUEE
       ============================================ */
    const partnersTrack = document.querySelector('.partners__track');
    if (partnersTrack) {
        let pos = 0;
        let paused = false;
        const speed = 0.8;
        let halfWidth = 0;

        function recalcWidth() {
            halfWidth = partnersTrack.scrollWidth / 2;
        }

        recalcWidth();
        window.addEventListener('load', recalcWidth);
        window.addEventListener('resize', recalcWidth);

        function scrollMarquee() {
            if (!paused && halfWidth > 0) {
                pos -= speed;
                if (Math.abs(pos) >= halfWidth) pos = 0;
                partnersTrack.style.transform = 'translateX(' + pos + 'px)';
            }
            requestAnimationFrame(scrollMarquee);
        }

        const marqueeEl = document.querySelector('.partners__marquee');
        if (marqueeEl) {
            marqueeEl.addEventListener('mouseenter', () => { paused = true; });
            marqueeEl.addEventListener('mouseleave', () => { paused = false; });
        }
        partnersTrack.addEventListener('focusin', () => { paused = true; });
        partnersTrack.addEventListener('focusout', () => { paused = false; });

        requestAnimationFrame(scrollMarquee);
    }

    /* ============================================
       SECTION PARALLAX (subtle)
       ============================================ */
    function initSectionParallax() {
        if (prefersReducedMotion()) return;

        const parallaxEls = document.querySelectorAll('.parallax-bg');
        if (!parallaxEls.length) return;

        let scrollTicking = false;

        window.addEventListener('scroll', () => {
            if (scrollTicking) return;
            scrollTicking = true;

            requestAnimationFrame(() => {
                parallaxEls.forEach((el) => {
                    const rect = el.getBoundingClientRect();
                    const speed = parseFloat(el.dataset.parallaxSpeed) || 0.15;
                    const offset = rect.top * speed;
                    el.style.transform = 'translateY(' + offset + 'px)';
                });
                scrollTicking = false;
            });
        }, { passive: true });
    }

    initSectionParallax();

    /* ============================================
       INITIAL SCROLL CHECK
       ============================================ */
    onNavScroll();
    toggleBackToTop();
    updateScrollProgress();

})();
