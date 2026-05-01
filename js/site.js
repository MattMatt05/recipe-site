// ===== Shared site behaviors: side menu, header/footer site info =====

// Build the side menu and inject it into every page
function injectSideMenu(activePage) {
  const menuHtml = `
    <div class="side-menu-overlay" id="sideMenuOverlay" onclick="closeSideMenu()"></div>
    <aside class="side-menu" id="sideMenu" aria-hidden="true">
      <button class="side-menu-close" onclick="closeSideMenu()" aria-label="Close menu">×</button>
      <div class="side-menu-body">
        <nav class="side-menu-nav">
          <a href="index.html" data-page="welcome">Welcome</a>
          <a href="recipes.html" data-page="home">Home</a>
          <a href="recipes.html?cat=Beautiful%20Things" data-page="beautiful">Beautiful Things</a>
          <a href="recipes.html?cat=Community" data-page="community">Community</a>
          <a href="recipes.html?cat=Field%20Trips" data-page="field-trips">Field Trips</a>
          <a href="recipes.html?cat=Food" data-page="food">Food</a>
          <a href="recipes.html?cat=Spaces" data-page="spaces">Spaces</a>
          <a href="recipes.html?cat=Quotes" data-page="quotes">Quotes</a>
          <a href="about.html" data-page="about">About</a>
          <a href="contact.html" data-page="contact">Contact</a>
        </nav>

        <div class="side-menu-about">
          <div class="side-menu-about-image">
            <img id="sideAboutImage" src="" alt="">
          </div>
          <p class="side-menu-about-eyebrow">about me</p>
          <h3 class="side-menu-about-name" id="sideAboutName">Angela St. Cyr</h3>
          <div class="side-menu-about-yellow-bar"></div>
          <p class="side-menu-about-bio" id="sideAboutBio"></p>
          <div class="side-menu-about-links">
            <a href="about.html">Read more about me</a>
            <a href="contact.html">Get in touch</a>
          </div>
          <div class="side-menu-about-social">
            <a data-social="instagram" href="#" target="_blank" rel="noopener" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a data-social="pinterest" href="#" target="_blank" rel="noopener" aria-label="Pinterest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </aside>
  `;
  document.body.insertAdjacentHTML('afterbegin', menuHtml);

  if (activePage) {
    const link = document.querySelector(`.side-menu-nav a[data-page="${activePage}"]`);
    if (link) link.classList.add('active');
  }
}

function openSideMenu() {
  document.getElementById('sideMenu').classList.add('open');
  document.getElementById('sideMenuOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSideMenu() {
  document.getElementById('sideMenu').classList.remove('open');
  document.getElementById('sideMenuOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSideMenu();
});

// Scroll progress bar + scroll-to-top button
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');

  // Inject scroll-to-top button
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.id = 'scrollTopBtn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);

  function update() {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = Math.max(0, Math.min(1, scrolled)) * 100 + '%';
    btn.classList.toggle('visible', h.scrollTop > 400);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}
document.addEventListener('DOMContentLoaded', initScrollProgress);

// Apply site info: logo image, social links, side-menu about card
function applySiteInfo(s) {
  // Logo (now uses an image)
  const logoSrc = s.logo_image || 'images/logo.webp';
  const logoEls = document.querySelectorAll('[data-site-logo]');
  logoEls.forEach(el => {
    el.innerHTML = `<img src="${logoSrc}" alt="${escapeAttr(s.title || 'Home')}">`;
  });

  // Footer logo
  const footerLogos = document.querySelectorAll('[data-footer-logo]');
  footerLogos.forEach(el => {
    el.innerHTML = `<img src="${logoSrc}" alt="${escapeAttr(s.title || 'Home')}">`;
  });

  // Social links
  document.querySelectorAll('[data-social="pinterest"]').forEach(el => {
    if (s.pinterest_url) el.href = s.pinterest_url;
  });
  document.querySelectorAll('[data-social="instagram"]').forEach(el => {
    if (s.instagram_url) el.href = s.instagram_url;
  });

  // Side menu about card
  const sideImg = document.getElementById('sideAboutImage');
  const sideName = document.getElementById('sideAboutName');
  const sideBio = document.getElementById('sideAboutBio');
  if (sideImg && s.about_image) sideImg.src = s.about_image;
  else if (sideImg && s.intro_image) sideImg.src = s.intro_image;
  if (sideName && s.author) sideName.textContent = s.author;
  if (sideBio) sideBio.textContent = s.menu_bio || s.about_short || '';
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/["'<>&]/g, m => ({
    '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;', '&': '&amp;'
  }[m]));
}
