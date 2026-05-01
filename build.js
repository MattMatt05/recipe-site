#!/usr/bin/env node
/**
 * build.js — Generate static HTML files for every recipe in recipes.json
 *
 * Usage: node build.js
 *
 * Reads recipes.json and creates one .html file per recipe inside the
 * /recipes folder. Each file is fully self-contained and works without JS.
 * The dynamic recipe.html?id=... approach still works — this script is for
 * SEO-friendly URLs and static hosting.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'recipes.json');
const OUT_DIR = path.join(ROOT, 'recipes');

const INSTAGRAM_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;

const PINTEREST_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`;

const SEARCH_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeAttr(str) { return escapeHtml(str); }

function recipeTemplate(recipe, site, allRecipes) {
  // Render flexible sections (with backwards compatibility for old ingredients/instructions arrays)
  let sections = recipe.sections || [];
  if ((!sections || !sections.length) && (recipe.ingredients || recipe.instructions)) {
    sections = [];
    if (recipe.ingredients && recipe.ingredients.length) {
      sections.push({ type: 'heading', text: 'Ingredients' });
      sections.push({ type: 'ingredients', items: recipe.ingredients });
    }
    if (recipe.instructions && recipe.instructions.length) {
      sections.push({ type: 'heading', text: 'Instructions' });
      sections.push({ type: 'instructions', items: recipe.instructions });
    }
  }

  let stepCounter = 0;
  const sectionsHtml = sections.map(section => {
    if (section.type === 'paragraph') {
      return `      <p class="post-paragraph">${escapeHtml(section.text || '')}</p>`;
    }
    if (section.type === 'heading') {
      return `      <h2 class="post-section-heading">${escapeHtml(section.text || '')}</h2>`;
    }
    if (section.type === 'ingredients') {
      const items = (section.items || []).map(i => `        <li>${escapeHtml(i)}</li>`).join('\n');
      return `      <ul class="ingredients-list">\n${items}\n      </ul>`;
    }
    if (section.type === 'instructions') {
      const items = (section.items || []).map(i => {
        stepCounter++;
        return `        <li data-step="${stepCounter}">${escapeHtml(i)}</li>`;
      }).join('\n');
      return `      <ol class="instructions-list">\n${items}\n      </ol>`;
    }
    return '';
  }).join('\n\n');

  const metaItems = [];
  if (recipe.prep_time) metaItems.push(`<span class="post-meta-item">Prep · <strong>${escapeHtml(recipe.prep_time)}</strong></span>`);
  if (recipe.cook_time) metaItems.push(`<span class="post-meta-item">Cook · <strong>${escapeHtml(recipe.cook_time)}</strong></span>`);
  if (recipe.servings) metaItems.push(`<span class="post-meta-item">Yield · <strong>${escapeHtml(recipe.servings)}</strong></span>`);
  const metaRow = metaItems.length ? `<div class="post-meta-row">${metaItems.join('')}</div>` : '';

  const tagsHtml = (recipe.tags && recipe.tags.length) ? `
    <div class="post-tags">
      ${recipe.tags.map(t => `<span class="post-tag">${escapeHtml(t)}</span>`).join('')}
    </div>` : '';

  const tip = recipe.tip ? `
    <div class="post-tip">
      <p class="post-tip-label">Tip</p>
      <p class="post-tip-text">${escapeHtml(recipe.tip)}</p>
    </div>` : '';

  // Most recent posts (excluding current)
  const others = allRecipes
    .filter(r => r.id !== recipe.id)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 3);

  const recentHtml = others.map(o => `
        <a href="../recipe.html?id=${encodeURIComponent(o.id)}" class="sidebar-recent-item">
          <div class="sidebar-recent-image">
            <img src="${escapeAttr(o.image)}" alt="${escapeAttr(o.title)}" loading="lazy">
          </div>
          <h4 class="sidebar-recent-title">${escapeHtml(o.title)}</h4>
          <p class="sidebar-recent-category">${escapeHtml((o.category || '').toUpperCase())}</p>
        </a>`).join('');

  const pinterestUrl = site.pinterest_url || '#';
  const instagramUrl = site.instagram_url || '#';
  const authorName = site.author || site.title || 'Home';
  const siteTitle = escapeHtml(site.title || 'Home');
  const logoSrc = site.logo_image || 'images/logo.webp';
  const logoTag = `<img src="../${escapeAttr(logoSrc)}" alt="${siteTitle}">`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(recipe.title)} — ${siteTitle}</title>
<meta name="description" content="${escapeHtml(recipe.description || '')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css">
</head>
<body>

<div class="scroll-progress" id="scrollProgress"></div>

<header class="site-header">
  <button class="menu-toggle" onclick="openSideMenu()" aria-label="Open menu">
    <span></span><span></span><span></span>
  </button>
  <a href="../index.html" class="site-logo" aria-label="Home">${logoTag}</a>
  <div class="header-icons">
    <a href="${escapeAttr(instagramUrl)}" target="_blank" rel="noopener" aria-label="Instagram">${INSTAGRAM_SVG}</a>
    <a href="${escapeAttr(pinterestUrl)}" target="_blank" rel="noopener" aria-label="Pinterest">${PINTEREST_SVG}</a>
    <a href="../recipes.html" aria-label="Search">${SEARCH_SVG}</a>
  </div>
</header>

<main>
  <div class="post-hero">
    <img src="${escapeAttr(recipe.image)}" alt="${escapeAttr(recipe.title)}">
  </div>

  <div class="post-title-block">
    <h1>${escapeHtml(recipe.title)}</h1>
    <div class="post-underline"></div>
    <p class="post-category">${escapeHtml((recipe.category || '').toUpperCase())}</p>
  </div>

  <div class="post-body">
    <article class="post-content">
      ${recipe.description ? `<p class="post-description">${escapeHtml(recipe.description)}</p>` : ''}
      ${metaRow}

${sectionsHtml}
${tip}
${tagsHtml}
      <div style="text-align:center; margin-top:40px;">
        <a href="../recipes.html" class="back-link">← Back to all posts</a>
      </div>
    </article>

    <aside class="post-sidebar">
      <p class="sidebar-author">${escapeHtml(authorName)}</p>
      <h3 class="sidebar-section-title">Most Recent Posts</h3>
      <div class="sidebar-recent">${recentHtml}
      </div>
    </aside>
  </div>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-ornament">
      <span class="line"></span>
      <span class="mark">✦</span>
      <span class="line"></span>
    </div>
    <p class="footer-logo">${logoTag}</p>
    <div class="footer-social">
      <a href="${escapeAttr(instagramUrl)}" target="_blank" rel="noopener" aria-label="Instagram">${INSTAGRAM_SVG.replace(/width="20" height="20"/, 'width="18" height="18"')}</a>
      <a href="${escapeAttr(pinterestUrl)}" target="_blank" rel="noopener" aria-label="Pinterest">${PINTEREST_SVG.replace(/width="20" height="20"/, 'width="18" height="18"')}</a>
    </div>
    <div class="footer-links">
      <a href="../about.html">About</a>
      <span class="footer-sep">·</span>
      <a href="../contact.html">Contact</a>
    </div>
    <p class="footer-text">© 2026</p>
  </div>
</footer>

<script>
// Inline minimal side menu for static pages (no external JS dependency)
(function() {
  const menuHtml = \`
    <div class="side-menu-overlay" id="sideMenuOverlay" onclick="closeSideMenu()"></div>
    <aside class="side-menu" id="sideMenu" aria-hidden="true">
      <button class="side-menu-close" onclick="closeSideMenu()" aria-label="Close menu">×</button>
      <div class="side-menu-body">
        <nav class="side-menu-nav">
          <a href="../index.html">Welcome</a>
          <a href="../recipes.html">Home</a>
          <a href="../recipes.html?cat=Beautiful%20Things">Beautiful Things</a>
          <a href="../recipes.html?cat=Community">Community</a>
          <a href="../recipes.html?cat=Field%20Trips">Field Trips</a>
          <a href="../recipes.html?cat=Food">Food</a>
          <a href="../recipes.html?cat=Spaces">Spaces</a>
          <a href="../recipes.html?cat=Quotes">Quotes</a>
          <a href="../about.html">About</a>
          <a href="../contact.html">Contact</a>
        </nav>
        <div class="side-menu-about">
          <div class="side-menu-about-image">
            <img src="${escapeAttr(site.about_image || site.intro_image || '')}" alt="">
          </div>
          <p class="side-menu-about-eyebrow">about me</p>
          <h3 class="side-menu-about-name">${escapeHtml(authorName)}</h3>
          <div class="side-menu-about-yellow-bar"></div>
          <p class="side-menu-about-bio">${escapeHtml(site.menu_bio || site.about_short || '')}</p>
          <div class="side-menu-about-links">
            <a href="../about.html">Read more about me</a>
            <a href="../contact.html">Get in touch</a>
          </div>
          <div class="side-menu-about-social">
            <a href="${escapeAttr(instagramUrl)}" target="_blank" rel="noopener" aria-label="Instagram">${INSTAGRAM_SVG.replace(/width="20" height="20"/, 'width="18" height="18"')}</a>
            <a href="${escapeAttr(pinterestUrl)}" target="_blank" rel="noopener" aria-label="Pinterest">${PINTEREST_SVG.replace(/width="20" height="20"/, 'width="18" height="18"')}</a>
          </div>
        </div>
      </div>
    </aside>
  \`;
  document.body.insertAdjacentHTML('afterbegin', menuHtml);
})();
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSideMenu(); });

// Scroll progress + scroll-to-top
(function() {
  const bar = document.getElementById('scrollProgress');
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
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
})();
</script>

</body>
</html>
`;
}

function build() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ recipes.json not found at', DATA_FILE);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const recipes = data.recipes || [];
  const site = data.site || { title: 'Beautiful Things' };

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let count = 0;
  for (const recipe of recipes) {
    if (!recipe.id) {
      console.warn('⚠ Skipping recipe with no id:', recipe.title);
      continue;
    }
    const filePath = path.join(OUT_DIR, recipe.id + '.html');
    fs.writeFileSync(filePath, recipeTemplate(recipe, site, recipes));
    console.log('✓ Generated:', path.relative(ROOT, filePath));
    count++;
  }

  console.log(`\n🎉 Built ${count} recipe page${count === 1 ? '' : 's'} into /recipes/`);
}

build();
