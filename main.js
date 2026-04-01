// main.js - Functional logic for Sri Lankan Safest Driving

console.log('Script main.js loaded');

// ── Google Translate: hide top banner/tooltip ───────────────────────
function hideGoogleTranslateUi() {
    try {
        // Remove/hide only the TOP BANNER iframe (don't touch the translation widget internals)
        document
            .querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame')
            .forEach((el) => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.height = '0';
                if (el.tagName === 'IFRAME') el.remove();
            });

        // Sometimes the banner iframe is wrapped in a top-level .skiptranslate container.
        // Remove only the wrapper(s) that actually contain the banner iframe.
        document.querySelectorAll('body > .skiptranslate').forEach((wrap) => {
            if (wrap.querySelector('iframe.goog-te-banner-frame, .goog-te-banner-frame')) {
                wrap.remove();
            }
        });

        // Remove tooltip containers
        document.getElementById('goog-gt-tt')?.remove();
        document.querySelectorAll('.goog-te-balloon-frame').forEach(el => el.remove());

        // Google sometimes pushes the page down using inline styles
        document.documentElement.style.setProperty('margin-top', '0px', 'important');
        document.body.style.setProperty('top', '0px', 'important');
    } catch {
        // ignore
    }
}

// ── Ensure Translate + UI exists on every page ──────────────────────
function ensureLanguageSwitcherExists() {
    if (document.querySelector('.lang-switcher')) return;
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const li = document.createElement('li');
    li.className = 'lang-switcher';
    li.innerHTML = `
      <button class="lang-switcher-btn" aria-label="Switch Language">
        <span class="lang-globe">&#127760;</span> LANGUAGE &#9660;
      </button>
      <div class="lang-dropdown"></div>
    `.trim();

    navLinks.appendChild(li);
}

function ensureGoogleTranslateLoaded() {
    // Hidden element required by google.translate.TranslateElement
    if (!document.getElementById('google_translate_element')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.display = 'none';
        document.body.appendChild(div);
    }

    // Load Google Translate element script if missing
    const hasScript = Array.from(document.scripts).some((s) =>
        (s.src || '').includes('translate_a/element.js?cb=googleTranslateElementInit')
    );
    if (!hasScript) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }
}

let translateUiGuardStarted = false;
function startGoogleTranslateUiGuard() {
    if (translateUiGuardStarted) return;
    translateUiGuardStarted = true;

    // Initial attempt
    hideGoogleTranslateUi();

    // Keep enforcing: fast at first, then steady.
    const start = Date.now();
    const intervalFast = setInterval(() => {
        hideGoogleTranslateUi();
        if (Date.now() - start > 15000) clearInterval(intervalFast);
    }, 250);

    // After the first burst, keep a light periodic enforcement.
    // (Avoid aggressive removal that can interfere with translation internals.)
    setInterval(hideGoogleTranslateUi, 2000);

    // Observe DOM changes (Google injects banner/tooltip dynamically)
    const observer = new MutationObserver(() => {
        hideGoogleTranslateUi();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

// ── Google Translate Init ──────────────────────────────────────────
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false
    }, 'google_translate_element');

    // Ensure the top banner never appears
    startGoogleTranslateUiGuard();
}

// Language list (code, flag emoji, native name)
const LANGUAGES = [
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'it', flag: '🇮🇹', name: 'Italiano' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
    { code: 'pt', flag: '🇵🇹', name: 'Português' },
    { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
    { code: 'pl', flag: '🇵🇱', name: 'Polski' },
    { code: 'ru', flag: '🇷🇺', name: 'Русский' },
    { code: 'ar', flag: '🇸🇦', name: 'العربية' },
    { code: 'zh-CN', flag: '🇨🇳', name: '中文 (简体)' },
    { code: 'zh-TW', flag: '🇹🇼', name: '中文 (繁體)' },
    { code: 'ja', flag: '🇯🇵', name: '日本語' },
    { code: 'ko', flag: '🇰🇷', name: '한국어' },
    { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
    { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
    { code: 'sv', flag: '🇸🇪', name: 'Svenska' },
    { code: 'da', flag: '🇩🇰', name: 'Dansk' },
    { code: 'fi', flag: '🇫🇮', name: 'Suomi' },
    { code: 'no', flag: '🇳🇴', name: 'Norsk' },
    { code: 'cs', flag: '🇨🇿', name: 'Čeština' },
    { code: 'sk', flag: '🇸🇰', name: 'Slovenčina' },
    { code: 'uk', flag: '🇺🇦', name: 'Українська' },
    { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
    { code: 'ro', flag: '🇷🇴', name: 'Română' },
    { code: 'hu', flag: '🇭🇺', name: 'Magyar' },
    { code: 'he', flag: '🇮🇱', name: 'עברית' },
    { code: 'th', flag: '🇹🇭', name: 'ภาษาไทย' },
    { code: 'id', flag: '🇮🇩', name: 'Indonesia' },
    { code: 'ms', flag: '🇲🇾', name: 'Melayu' },
];

// ── Directly trigger Google Translate via its hidden select ───────
function applyGoogleTranslate(langCode) {
    const select = document.querySelector('select.goog-te-combo');
    if (!select) return false;
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
    return true;
}

function isSupportedLang(code) {
    return LANGUAGES.some(l => l.code === code);
}

function getLangFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get('lang');
        if (lang && isSupportedLang(lang)) return lang;
    } catch {
        // ignore
    }
    return null;
}

function setOrUpdateLangParam(href, langCode) {
    if (!href) return href;
    const trimmed = href.trim();

    // Skip external / non-navigation links
    if (
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:') ||
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('#')
    ) {
        return href;
    }

    // Preserve hash fragment
    const [beforeHash, hash = ''] = trimmed.split('#');
    const hashPart = hash ? `#${hash}` : '';

    // Preserve existing query
    const [pathPart, query = ''] = beforeHash.split('?');
    const qs = new URLSearchParams(query);

    if (!langCode || langCode === 'en') {
        qs.delete('lang');
    } else {
        qs.set('lang', langCode);
    }

    const q = qs.toString();
    return `${pathPart}${q ? `?${q}` : ''}${hashPart}`;
}

function decorateInternalLinks(langCode) {
    document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (!href) return;
        const updated = setOrUpdateLangParam(href, langCode);
        if (updated !== href) a.setAttribute('href', updated);
    });
}

function updateCurrentUrlLangParam(langCode) {
    try {
        const url = new URL(window.location.href);
        if (!langCode || langCode === 'en') url.searchParams.delete('lang');
        else url.searchParams.set('lang', langCode);
        window.history.replaceState({}, '', url.toString());
    } catch {
        // ignore
    }
}

// ── Persist language choice in cookie so it survives navigation ────
function setTranslateCookie(langCode) {
    const val = (langCode === 'en') ? '/en/en' : '/en/' + langCode;
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const base = `googtrans=${val}; expires=${expiry.toUTCString()}; path=/`;
    document.cookie = base;
    if (location.hostname) document.cookie = base + `; domain=${location.hostname}`;
}

// ── Update all nav buttons to show currently active language ───────
function updateLangButtons(langCode) {
    const lang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
    document.querySelectorAll('.lang-switcher').forEach(sw => {
        const btn = sw.querySelector('.lang-switcher-btn');
        if (btn) btn.innerHTML = `<span class="lang-globe">${lang.flag}</span> ${lang.name} &#9660;`;
        sw.querySelectorAll('.lang-dropdown button').forEach(b => {
            b.classList.toggle('active-lang', b.dataset.code === langCode);
        });
    });
}

// ── Called when user picks a language from the dropdown ────────────
function switchLanguage(langCode) {
    localStorage.setItem('slsd_lang', langCode);
    setTranslateCookie(langCode);
    updateLangButtons(langCode);
    updateCurrentUrlLangParam(langCode);
    decorateInternalLinks(langCode);

    if (langCode === 'en') {
        // Clear cookies then reload to restore original English
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname;
        window.location.reload();
        return;
    }

    // Try to trigger translation immediately via Google Translate's select
    if (!applyGoogleTranslate(langCode)) {
        // Widget not ready yet — poll until it loads (max 4 seconds), then reload
        let tries = 0;
        const poll = setInterval(() => {
            tries++;
            if (applyGoogleTranslate(langCode)) {
                clearInterval(poll);
            } else if (tries >= 8) {
                clearInterval(poll);
                // Final fallback: reload with URL param + cookie applied
                updateCurrentUrlLangParam(langCode);
                window.location.reload();
            }
        }, 500);
    }
}

// ── Build language switcher dropdowns in the navbar ────────────────
function initLanguageSwitchers() {
    const urlLang = getLangFromUrl();
    const savedLang = urlLang || localStorage.getItem('slsd_lang') || 'en';
    if (urlLang) {
        localStorage.setItem('slsd_lang', urlLang);
        setTranslateCookie(urlLang);
    }
    const activeLang = LANGUAGES.find(l => l.code === savedLang) || LANGUAGES[0];

    document.querySelectorAll('.lang-switcher').forEach(switcher => {
        const btn = switcher.querySelector('.lang-switcher-btn');
        const dropdown = switcher.querySelector('.lang-dropdown');

        // Set button label to saved language
        if (btn) {
            btn.innerHTML = `<span class="lang-globe">${activeLang.flag}</span> ${activeLang.name} &#9660;`;
        }

        // Build the dropdown list of languages
        if (dropdown) {
            dropdown.innerHTML = '';
            LANGUAGES.forEach(lang => {
                const item = document.createElement('button');
                item.dataset.code = lang.code;
                item.innerHTML = `<span class="lang-flag">${lang.flag}</span>${lang.name}`;
                if (lang.code === savedLang) item.classList.add('active-lang');
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    switchLanguage(lang.code);
                    switcher.classList.remove('active');
                });
                dropdown.appendChild(item);
            });
        }

        // Mobile: click btn to toggle dropdown (desktop uses CSS hover)
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.innerWidth <= 992) {
                    switcher.classList.toggle('active');
                }
            });
        }
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.lang-switcher.active').forEach(s => s.classList.remove('active'));
    });

    // Ensure links keep the selected language even without cookies (e.g., file://)
    decorateInternalLinks(savedLang);

    // Auto-apply saved language once Google Translate widget loads
    if (savedLang !== 'en') {
        let tries = 0;
        const poll = setInterval(() => {
            tries++;
            if (applyGoogleTranslate(savedLang)) {
                clearInterval(poll);
            } else if (tries >= 15) {
                clearInterval(poll);
                // Fallback: force a single reload so Google can apply the cookie-based translation.
                // Guard against infinite reload loops.
                const guardKey = 'slsd_lang_reload_guard';
                const alreadyReloaded = sessionStorage.getItem(guardKey) === savedLang;
                if (!alreadyReloaded) {
                    sessionStorage.setItem(guardKey, savedLang);
                    window.location.reload();
                }
            }
        }, 400);
    }
}


const init = () => {
    console.log('DOM ready, initializing...');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            console.log('Mobile menu toggled');
        });

        // Mobile Dropdown Toggle
        document.querySelectorAll('.dropdown > a').forEach(dropdownToggle => {
            dropdownToggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    e.stopPropagation();
                    const parent = dropdownToggle.parentElement;

                    // Close other dropdowns
                    document.querySelectorAll('.dropdown').forEach(d => {
                        if (d !== parent) d.classList.remove('active');
                    });

                    parent.classList.toggle('active');
                    console.log('Mobile dropdown toggled:', parent.classList.contains('active'));
                }
            });
        });
    }

    // Toggle detailed itineraries (Backup logic - inline is primary)
    const seeMoreBtn = document.getElementById('see-more-btn');
    const detailedContainer = document.getElementById('detailed-itineraries-container');

    if (seeMoreBtn && detailedContainer) {
        seeMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            detailedContainer.style.display = 'block';
            seeMoreBtn.style.display = 'none';
            detailedContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Close menu on link click
    document.querySelectorAll('.nav-links a:not(.dropdown > a), .dropdown-menu a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });

    // Sticky Navbar logic
    const header = document.querySelector('.main-header');
    const handleScroll = () => {
        if (window.pageYOffset > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // ── Image Carousel Helper ──────────────────────────────────────────────
    function setupCarousel(trackId, prevBtnId, nextBtnId, dotsNavId) {
        const track = document.getElementById(trackId);
        if (!track) return;

        const items = Array.from(track.children);
        const nextButton = document.getElementById(nextBtnId);
        const prevButton = document.getElementById(prevBtnId);
        const dotsNav = document.getElementById(dotsNavId);

        let currentIndex = 0;
        let autoSlideInterval;

        // Determine if it's a multi-item carousel
        const isMulti = track.classList.contains('tour-carousel-track') || track.classList.contains('multi-carousel-track');

        const getItemsPerPage = () => {
            // For single large image carousel layout
            if (isMulti) return 1;
            return 1;
        };

        const getMaxIndex = () => {
            const itemsPerPage = getItemsPerPage();
            return Math.max(0, items.length - itemsPerPage);
        };

        // Create dots
        const createDots = () => {
            if (!dotsNav) return;
            dotsNav.innerHTML = '';

            // For multi-carousel, we can still have dots for each individual item 
            // but restricted so we don't scroll past the end
            const maxIdx = getMaxIndex();
            const dotCount = isMulti ? maxIdx + 1 : items.length;

            if (dotCount <= 1) return; // No dots needed for single page

            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('div');
                dot.classList.add('carousel-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    moveToSlide(i);
                    resetAutoSlide();
                });
                dotsNav.appendChild(dot);
            }
        };

        createDots();
        window.addEventListener('resize', () => {
            createDots();
            moveToSlide(currentIndex); // Re-align on resize
        });

        function updateDots() {
            if (!dotsNav) return;
            const dots = Array.from(dotsNav.children);
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        function moveToSlide(index) {
            const maxIndex = getMaxIndex();
            const itemsPerPage = getItemsPerPage();

            if (index < 0) index = maxIndex;
            else if (index > maxIndex) index = 0;

            const slidePercentage = 100 / itemsPerPage;
            track.style.transform = `translateX(-${index * slidePercentage}%)`;
            currentIndex = index;
            updateDots();
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                moveToSlide(currentIndex + 1);
            }, 5000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                moveToSlide(currentIndex + 1);
                resetAutoSlide();
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                moveToSlide(currentIndex - 1);
                resetAutoSlide();
            });
        }

        // Pause on Hover
        const container = track.parentElement;
        if (container) {
            container.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
            container.addEventListener('mouseleave', () => startAutoSlide());
        }

        // Initial Start
        startAutoSlide();
    }

    // ── Global Carousel Auto-Initialization ──────────────────────────────
    // This logic automatically finds any carousel track and its controls
    // based on common naming conventions (e.g. prefix-carousel, prefix-prev, etc.)
    const autoDiscoverCarousels = () => {
        const potentialTracks = document.querySelectorAll('[id$="-carousel"], [id$="-track"]');
        potentialTracks.forEach(track => {
            const id = track.id;
            const prefix = id.replace('-carousel', '').replace('-track', '');

            // Avoid duplicate initialization by marking the track
            if (!track.dataset.initialized) {
                console.log(`Auto-initializing carousel: ${id}`);
                setupCarousel(id, `${prefix}-prev`, `${prefix}-next`, `${prefix}-dots`);
                track.dataset.initialized = 'true';
            }
        });
    };

    // Initialize all carousels found on the current page
    autoDiscoverCarousels();

    // ── FAQ Accordion ───────────────────────────────────────────────────
    const accordionItems = document.querySelectorAll('.faq-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.faq-question');
        if (header) {
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Close all other items for a cleaner accordion effect
                accordionItems.forEach(i => i.classList.remove('active'));

                // Toggle current item
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });

    // ── Global Scroll Reveal Animations ──────────────────────────────────
    const revealElements = () => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, we can stop observing
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Targeted elements for reveal (Comprehensive list for all pages)
        const elementsToWatch = document.querySelectorAll(
            '.section-title, .service-card, .explore-card, .transfer-content, .transfer-image, .faq-item, .gallery-carousel-wrapper, .villa-card, .registration-flex, .intro-content, .timeline-item, .location-detail, .tour-overview, .about-text-block, .about-highlight, .certificate-container, .registration-header, .about-header, .services-header, .rentals-header, .registration-text-block, .best-places-header, .place-card, .tour-detail-block, .tour-info-content, .contact-heading, .contact-form-card, .contact-info, .reviews-header, .masonry-item, .google-reviews-section, .page-title, .included-section, .price-item, .rental-card, .villa-title-header, .villa-description, .cta-section, .registration-content, .main-review-display, .thumbnail-carousel'
        );

        elementsToWatch.forEach(el => {
            if (el) {
                el.classList.add('reveal', 'reveal-up');
                observer.observe(el);
            }
        });

        // Add staggered delays to children of grids and lists
        const staggeredGrids = '.services-grid, .itineraries-grid, .villas-grid, .best-places-grid, .detailed-itineraries, .masonry-grid, .price-list, .rentals-grid, .amenities-list, .about-list, .route-list, .thumbnail-carousel';
        document.querySelectorAll(staggeredGrids).forEach(grid => {
            const children = grid.children;
            for (let i = 0; i < children.length; i++) {
                children[i].style.transitionDelay = `${(i % 8) * 0.1}s`;
            }
        });
    };

    // Initialize reveal animations
    revealElements();

    // Ensure language UI + google translate exist on every page
    ensureLanguageSwitcherExists();
    ensureGoogleTranslateLoaded();

    // Initialize language switcher
    initLanguageSwitchers();

    // Keep Google Translate banner hidden (it may re-inject after language change)
    startGoogleTranslateUiGuard();

    console.log('Sri Lankan Safest Driving website fully initialized!');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
