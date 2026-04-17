/* ==========================================================================
   EVERYTHING MEDIA — SCRIPT
   Native scroll, IntersectionObserver reveals, cursor-light, form handling
   ========================================================================== */

(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    /* ----------------------------------------------------------------------
       PRELOADER — wait for first paint + minimum display time
       ---------------------------------------------------------------------- */
    const preloader = document.getElementById('preloader');
    const minPreloaderTime = 1600;
    const startTime = Date.now();

    const finishPreload = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minPreloaderTime - elapsed);
        setTimeout(() => {
            preloader.classList.add('done');
            document.body.classList.add('loaded');
            // Kick off first hero still after preloader exits
            initHeroStills();
        }, remaining);
    };

    if (document.readyState === 'complete') {
        finishPreload();
    } else {
        window.addEventListener('load', finishPreload);
    }

    /* ----------------------------------------------------------------------
       HERO — rotating stills (replaces need for a cut reel at launch)
       ---------------------------------------------------------------------- */
    function initHeroStills() {
        const stills = document.querySelectorAll('.hero-still');
        if (!stills.length) return;

        let current = 0;
        stills[current].classList.add('active');

        if (reducedMotion) return;

        setInterval(() => {
            stills[current].classList.remove('active');
            current = (current + 1) % stills.length;
            stills[current].classList.add('active');
        }, 5000);
    }

    /* ----------------------------------------------------------------------
       CURSOR — dot + ring + soft light
       ---------------------------------------------------------------------- */
    const cursorLight = document.getElementById('cursor-light');
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const cursorLabel = document.getElementById('cursor-label');

    if (!isTouch && !reducedMotion) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let rx = mx, ry = my;
        let lx = mx, ly = my;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            // Dot follows instantly
            cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });

        const lerp = (a, b, t) => a + (b - a) * t;

        const tick = () => {
            rx = lerp(rx, mx, 0.18);
            ry = lerp(ry, my, 0.18);
            lx = lerp(lx, mx, 0.08); // slower for the light — feels atmospheric
            ly = lerp(ly, my, 0.08);

            cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            cursorLight.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`;

            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        // Interaction states
        document.querySelectorAll('[data-cursor]').forEach((el) => {
            const type = el.dataset.cursor;
            const label = el.dataset.label || type;

            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('expanded');
                cursorDot.classList.add('hide');
                cursorLabel.textContent = label;
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('expanded');
                cursorDot.classList.remove('hide');
            });
        });

        document.querySelectorAll('a:not([data-cursor]), button:not([data-cursor]), input, textarea, select').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('link');
                cursorDot.classList.add('hide');
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('link');
                cursorDot.classList.remove('hide');
            });
        });

        // Hide cursor on mouseout (window edge)
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
            cursorLight.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
            cursorLight.style.opacity = '1';
        });
    } else {
        // Remove cursor elements entirely on touch
        [cursorLight, cursorDot, cursorRing].forEach((el) => el && el.remove());
        document.body.style.cursor = 'auto';
    }

    /* ----------------------------------------------------------------------
       SCROLL PROGRESS + NAV
       ---------------------------------------------------------------------- */
    const scrollProgress = document.getElementById('scroll-progress');
    const nav = document.getElementById('nav');

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min(1, scrollY / max);
            scrollProgress.style.height = (progress * 100) + 'vh';

            if (scrollY > 120) {
                nav.classList.add('visible');
                if (scrollY > 300) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
            } else {
                nav.classList.remove('visible', 'scrolled');
            }

            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ----------------------------------------------------------------------
       MOBILE MENU
       ---------------------------------------------------------------------- */
    const mobileToggle = document.getElementById('nav-mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('menu-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const openMenu = () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (mobileToggle) mobileToggle.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    mobileLinks.forEach((a) => a.addEventListener('click', closeMenu));

    /* ----------------------------------------------------------------------
       INTERSECTION OBSERVER — scroll reveals
       ---------------------------------------------------------------------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.15, rootMargin: '-8% 0px -8% 0px' });

    document.querySelectorAll('.section-head, .positioning-body p, .work-tile, .cap-item, .method-step, .conviction, .fade-up').forEach((el) => {
        io.observe(el);
    });

    /* ----------------------------------------------------------------------
       FORM — validation + submission
       Uses mailto as a no-backend fallback so the site works from day one.
       When you connect a backend (Formspree, Resend, or a Vercel serverless
       function), replace the `submitForm` function body with a fetch() call.
       ---------------------------------------------------------------------- */
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    const submitBtn = form ? form.querySelector('.submit-btn') : null;

    // Track has-value state for floating labels (works for selects too)
    const formFields = form ? form.querySelectorAll('input, textarea, select') : [];
    formFields.forEach((field) => {
        const parent = field.closest('.form-field');
        const check = () => {
            if (field.value && field.value.trim() !== '') {
                parent.classList.add('has-value');
            } else {
                parent.classList.remove('has-value');
            }
        };
        field.addEventListener('input', check);
        field.addEventListener('change', check);
        check();
    });

    const setStatus = (message, type) => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.remove('success', 'error');
        if (type) statusEl.classList.add(type);
        statusEl.classList.add('visible');
    };

    const submitForm = async (data) => {
        // DEFAULT: open the user's email client pre-filled.
        // This works immediately, no backend.
        const subject = `New project — ${data.company || data.name}`;
        const bodyLines = [
            `Name: ${data.name}`,
            `Company / project: ${data.company || '—'}`,
            `Email: ${data.email}`,
            `Type: ${data.type}`,
            '',
            data.message
        ];
        const mailto = `mailto:hello@everythingmedia.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
        window.location.href = mailto;
        return { ok: true };

        // ---- When you want a real backend, uncomment below and delete mailto block above ----
        // const res = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // return { ok: res.ok };
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.elements['name'].value.trim(),
                company: form.elements['company'].value.trim(),
                email: form.elements['email'].value.trim(),
                type: form.elements['type'].value,
                message: form.elements['message'].value.trim()
            };

            // Minimal validation
            if (!data.name || !data.email || !data.type || !data.message) {
                setStatus('please fill in the required fields.', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                setStatus('that email doesn\'t look right.', 'error');
                return;
            }

            submitBtn.classList.add('sending');
            setStatus('opening your email…', null);

            try {
                const res = await submitForm(data);
                if (res.ok) {
                    setStatus('sent. we\'ll reply soon.', 'success');
                    form.reset();
                    formFields.forEach((f) => f.closest('.form-field').classList.remove('has-value'));
                } else {
                    setStatus('something went wrong. write us directly at hello@everythingmedia.studio', 'error');
                }
            } catch (err) {
                setStatus('something went wrong. write us directly at hello@everythingmedia.studio', 'error');
            } finally {
                submitBtn.classList.remove('sending');
            }
        });
    }

    /* ----------------------------------------------------------------------
       SMOOTH SCROLL for in-page anchors — keeps native inertia elsewhere
       ---------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.length <= 1) return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
            }
        });
    });

})();
