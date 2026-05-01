// ===== Home / Recipes Page (3-column grid) =====
let allRecipes = [];
let activeCategory = 'All';

fetch('recipes.json')
  .then(r => r.json())
  .then(data => {
    applySiteInfo(data.site || {});

    // Banner
    if (data.site) {
      const bannerImg = document.getElementById('bannerImage');
      const bannerBlurb = document.getElementById('bannerBlurb');
      if (bannerImg && data.site.intro_image) bannerImg.src = data.site.intro_image;
      if (bannerBlurb && data.site.about_short) bannerBlurb.textContent = data.site.about_short;
    }

    allRecipes = (data.recipes || []).slice().sort((a, b) =>
      new Date(b.date || 0) - new Date(a.date || 0)
    );

    buildCategoryFilters();

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('cat');
    if (q) document.getElementById('searchInput').value = q;
    if (cat) {
      activeCategory = cat;
      document.querySelectorAll('.filter-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === activeCategory);
      });
    }

    filterRecipes();
  })
  .catch(err => {
    console.error('Failed to load recipes.json:', err);
    document.getElementById('recipeGrid').innerHTML =
      '<p class="no-results">Could not load recipes. Make sure recipes.json is available.</p>';
  });

function buildCategoryFilters() {
  const categories = ['All', ...new Set(allRecipes.map(r => r.category))];
  const wrap = document.getElementById('categoryFilters');
  if (!wrap) return;
  wrap.innerHTML = categories.map(cat =>
    `<button class="filter-chip ${cat === activeCategory ? 'active' : ''}" data-cat="${escapeAttr(cat)}" onclick="setCategory('${escapeAttr(cat)}')">${escapeHtml(cat)}</button>`
  ).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  filterRecipes();
}

function filterRecipes() {
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const filtered = allRecipes.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    if (!q) return matchesCategory;
    const haystack = [
      r.title, r.description, r.category,
      ...(r.tags || []), ...(r.ingredients || [])
    ].join(' ').toLowerCase();
    return matchesCategory && haystack.includes(q);
  });
  renderGrid(filtered);
}

function renderGrid(list) {
  const grid = document.getElementById('recipeGrid');
  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No posts match your search. Try a different keyword.</p>';
    return;
  }

  grid.innerHTML = list.map(r => `
    <a href="recipe.html?id=${encodeURIComponent(r.id)}" class="recipe-card">
      <div class="recipe-card-image">
        <img src="${escapeAttr(r.image)}" alt="${escapeAttr(r.title)}" loading="lazy">
        <span class="recipe-card-view-tag">View Recipe</span>
      </div>
      <h2 class="recipe-card-title">${escapeHtml(r.title)}</h2>
      <div class="recipe-card-underline"></div>
      <p class="recipe-card-category">${escapeHtml((r.category || '').toUpperCase())}</p>
    </a>
  `).join('');
}
