const header = document.querySelector('.site-header');
const topButton = document.querySelector('#scroll-to-top');
const toast = document.querySelector('#toast-notification');
let toastTimer;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function showToast() {
  clearTimeout(toastTimer);
  toast.textContent = '아직 준비 중입니다.';
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
}

document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const current = trigger.closest('.accordion-item');
    const isOpen = current.classList.contains('is-open');
    document.querySelectorAll('.accordion-item').forEach((item) => {
      item.classList.remove('is-open');
      item.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      current.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});

const pageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.target.classList.toggle('is-visible', !entry.isIntersecting));
}, { threshold: 1 });
pageObserver.observe(document.querySelector('#hero'));

const headerObserver = new IntersectionObserver((entries) => {
  header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
}, { threshold: 0.9 });
headerObserver.observe(document.querySelector('#hero'));

topButton.addEventListener('click', () => document.querySelector('#hero').scrollIntoView({ behavior: 'smooth' }));

document.querySelectorAll('.media-frame img').forEach((image) => {
  image.addEventListener('error', () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.textContent = '이미지 준비 중';
    image.replaceWith(placeholder);
  }, { once: true });
});

/* =========================================================
   GA4 Event Tracking: section_view & cta_click
   ========================================================= */
(function initGA4Tracking() {
  if (window.__ga4TrackingInitialized) return;
  window.__ga4TrackingInitialized = true;

  // 1. CTA 클릭 측정 (cta_click)
  const ctaConfigs = [
    { selector: '#cta-hero, #cta-hero-btn, [data-cta-location="hero"]', location: 'hero' },
    { selector: '#cta-final, #cta-final-btn, [data-cta-location="final"]', location: 'final' }
  ];

  ctaConfigs.forEach(({ selector, location }) => {
    const btn = document.querySelector(selector);
    if (btn && !btn.dataset.ctaTracked) {
      btn.dataset.ctaTracked = 'true';
      btn.addEventListener('click', () => {
        if (typeof window.gtag === 'function') {
          try {
            window.gtag('event', 'cta_click', {
              button_location: location
            });
          } catch (e) {
            console.error('GA4 cta_click error:', e);
          }
        }
      });
    }
  });

  // 2. 구간 도달 측정 (section_view)
  const sectionTargets = [
    { selector: '#hero-title', name: 'hero' },
    { selector: '#detail-space-title, #detail-title', name: 'detail' },
    { selector: '#purchase-title', name: 'cta' }
  ];

  const sentSections = new Set();
  const headerElem = document.querySelector('.site-header');
  const headerHeight = headerElem ? headerElem.offsetHeight : 72;

  function sendSectionView(sectionName) {
    if (sentSections.has(sectionName)) return;
    sentSections.add(sectionName);
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'section_view', {
          section_name: sectionName
        });
      } catch (e) {
        console.error('GA4 section_view error:', e);
      }
    }
  }

  function isElementHalfVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const currentHeaderH = headerElem ? headerElem.offsetHeight : 72;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const visibleTop = Math.max(rect.top, currentHeaderH);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    return rect.height > 0 && (visibleHeight / rect.height) >= 0.5;
  }

  function checkCurrentlyVisibleSections() {
    if (document.visibilityState !== 'visible') return;
    sectionTargets.forEach(({ selector, name }) => {
      if (sentSections.has(name)) return;
      const el = document.querySelector(selector);
      if (el && isElementHalfVisible(el)) {
        sendSectionView(name);
        if (sectionObserver) {
          sectionObserver.unobserve(el);
        }
      }
    });
  }

  let sectionObserver = null;

  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver((entries) => {
      if (document.visibilityState !== 'visible') return;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const targetConfig = sectionTargets.find((t) => {
            const el = document.querySelector(t.selector);
            return el === entry.target;
          });

          if (targetConfig && !sentSections.has(targetConfig.name)) {
            sendSectionView(targetConfig.name);
            sectionObserver.unobserve(entry.target);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: `-${headerHeight}px 0px 0px 0px`
    });

    sectionTargets.forEach(({ selector, name }) => {
      if (sentSections.has(name)) return;
      const el = document.querySelector(selector);
      if (el) {
        sectionObserver.observe(el);
      }
    });
  }

  if (document.visibilityState === 'visible') {
    checkCurrentlyVisibleSections();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkCurrentlyVisibleSections();
    }
  });
})();
