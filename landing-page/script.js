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
