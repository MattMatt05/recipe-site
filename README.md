# Beautiful Things — Recipe Website

A clean, editorial-style recipe and lifestyle blog inspired by angelastcyr.com. All content lives in a single `recipes.json` file, and the site builds itself from that data.

## File Structure

```
recipe-site/
├── index.html          ← Intro/splash page (logo, photo, search)
├── recipes.html        ← Home (welcome banner + 3-column post grid)
├── recipe.html         ← Single post (loads any post by ?id=)
├── about.html          ← About page
├── contact.html        ← Contact page (with email form)
├── recipes.json        ← ALL site & post data lives here
├── build.js            ← Optional: generates static HTML per recipe
├── css/style.css
└── js/
    ├── site.js         ← Shared: side menu, header/footer
    └── recipes.js      ← Home page grid logic
```

## Design Notes

- White background, mostly black text, with a subtle yellow underline used as the only color accent (matching the original site)
- Hamburger menu in the top-left opens a slide-out side panel with all categories
- Centered logo across all pages
- Instagram, Pinterest, and search icons in the top-right
- 3-column square-image grid on the home page (title, yellow underline, category in caps)
- Single post pages have a full-width hero image, centered title, and a "Most Recent Posts" sidebar on the right showing 3 other posts

## How It Works

`recipes.json` is the single source of truth. The site dynamically reads from it on every page load — so adding, editing, or removing posts only requires editing this one file. No HTML changes needed.

## The `site` Block

```json
"site": {
  "title": "Beautiful Things",
  "author": "Angela",
  "intro_image": "https://...",
  "about_short": "I know you will find something here...",
  "contact_email": "hello@beautifulthings.com",
  "pinterest_url": "https://www.pinterest.com/yourhandle",
  "instagram_url": "https://www.instagram.com/yourhandle"
}
```

These values flow through to:
- The site logo (header on every page, footer on every page, intro page)
- The hero image on the intro and home pages
- The "Thanks for visiting!" blurb under both heroes
- The Instagram and Pinterest icons in every header and footer
- The contact form recipient email
- The "signed by" name on the About page

## Adding a New Post

Add an object to the `recipes` array in `recipes.json`. Recipe content is now built from a flexible `sections` array, so you can interleave paragraphs, headings, ingredient lists, and instruction lists in any order:

```json
{
  "id": "unique-url-friendly-slug",
  "title": "Recipe Title",
  "category": "Food",
  "tags": ["tag1", "tag2"],
  "date": "2026-04-30",
  "image": "https://example.com/photo.jpg",
  "description": "Short italic description shown at the top.",
  "prep_time": "15 minutes",
  "cook_time": "30 minutes",
  "servings": "4 servings",
  "sections": [
    { "type": "paragraph", "text": "Intro paragraph about the dish..." },
    { "type": "heading", "text": "For the marinade" },
    { "type": "ingredients", "items": ["1 cup soy sauce", "2 garlic cloves"] },
    { "type": "instructions", "items": ["Whisk everything together.", "Marinate for an hour."] },
    { "type": "heading", "text": "For the salad" },
    { "type": "ingredients", "items": ["Mixed greens", "Cherry tomatoes"] },
    { "type": "heading", "text": "To assemble" },
    { "type": "instructions", "items": ["Toss greens with dressing.", "Top with chicken."] }
  ],
  "tip": "Optional tip shown in a highlighted box."
}
```

### Section types

- **`paragraph`** — A regular block of body text. Use for intros, notes between steps, etc.
- **`heading`** — A bold section title with a yellow underline (e.g. "For the dressing").
- **`ingredients`** — A clean list of ingredients. You can have multiple of these in one recipe (one per component).
- **`instructions`** — A numbered list of steps. Numbering continues across multiple instruction blocks, so step 4 of the second block follows step 3 of the first.

### Notes

- `id` must be unique and URL-friendly (lowercase, hyphens, no spaces)
- Posts auto-sort newest first by `date` (use `YYYY-MM-DD`)
- Step numbers automatically run 1, 2, 3... across the whole recipe even when split into multiple instruction blocks
- Older posts using the legacy flat `ingredients` and `instructions` arrays still work — they're auto-converted on render
- Tags now appear as small chips at the bottom of each recipe
- The 3 most recent OTHER posts are auto-shown in the sidebar of every recipe page

## Running Locally

The site uses `fetch()` to load JSON, so it needs a real web server.

```bash
cd recipe-site
python3 -m http.server 8000
```

Visit `http://localhost:8000`

## Deploying to GitHub Pages

1. Push the `recipe-site` folder contents to a GitHub repo
2. Settings → Pages → set source to `main` branch, root folder
3. Site goes live at `https://username.github.io/repo-name/`

All paths are relative, so it works under any subdirectory URL.

## Optional: Pre-generating Static HTML

For SEO-friendly individual recipe URLs:

```bash
node build.js
```

This generates `recipes/<slug>.html` for each post. The dynamic `recipe.html?id=...` system still works without this — it's a bonus for static hosting and search indexing.

## Customizing Look & Feel

- **Colors:** edit the CSS variables at the top of `css/style.css` (`--yellow`, `--text`, `--bg`, etc.)
- **Side menu categories:** edit the `injectSideMenu` function in `js/site.js`
- **Footer text:** edit the `<footer>` block in each HTML file
