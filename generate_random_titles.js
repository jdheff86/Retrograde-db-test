const fs = require("fs");
const path = require("path");
const https = require("https");

const TMDB_API_KEY = "af1cc8eba723466ddbf55ab404c953e0";
const MOVIE_COUNT = 6;

const TITLES_DIR = path.join(__dirname, "titles");
const INDEX_HTML = path.join(TITLES_DIR, "index.html");
const QUARANTINE_DIR = path.join(__dirname, "titles_quarantine");

if (!fs.existsSync(QUARANTINE_DIR)) {
  fs.mkdirSync(QUARANTINE_DIR);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

function slugify(title, year) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}`;
}

function listExistingTitles() {
  return fs
    .readdirSync(TITLES_DIR)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .map((file) => file.replace(".html", ""));
}

async function getRandomMovie() {
  const page = Math.floor(Math.random() * 500) + 1;
  const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&page=${page}&sort_by=popularity.desc`;
  const data = await fetch(discoverUrl);
  const results = data.results || [];
  return results[Math.floor(Math.random() * results.length)];
}

async function getMovieDetails(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`;
  return await fetch(url);
}

function createHtml(movie, filename) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${movie.title} - Retrograde DB</title>
  <link rel="stylesheet" href="../styles/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="menu-icon">☰</div>
    <div class="site-title">RETROGRADE DATA BASE</div>
    <div class="search-icon">🔍</div>
  </header>
  <nav id="dropdownMenu" class="dropdown-menu hidden">
    <ul>
      <li><a href="../index.html">Home</a></li>
      <li><a href="index.html">Browse VHS Titles</a></li>
      <li><a href="../genres.html">Genres</a></li>
      <li><a href="../pricing.html">Pricing Info</a></li>
      <li><a href="../submit.html">Submit a Tape</a></li>
      <li><a href="../contact.html">Contact</a></li>
    </ul>
  </nav>
  <main class="home-container">
    <img src="../assets/vhs_placeholder_red_database.png" alt="${movie.title}" class="main-logo" />
    <h1 class="main-title">${movie.title}</h1>
    <p class="subtitle">${movie.release_date} • Rating: ${movie.vote_average}</p>
    <p class="subtitle">${movie.overview}</p>
    <a href="index.html" class="cta-button">← Back to Titles</a>
  </main>
  <script src="../scripts/menu.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(TITLES_DIR, `${filename}.html`), html, "utf-8");
  console.log(`✔️ ${filename}.html created`);
}

function updateIndexPage(existing) {
  const links = existing
    .sort()
    .map((slug) => {
      const name = slug
        .replace(/-\d{4}$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `<li><a href="${slug}.html">${name}</a></li>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>All VHS Titles - Retrograde DB</title>
  <link rel="stylesheet" href="../styles/style.css" />
  <script src="../scripts/menu.js" defer></script>
</head>
<body>
  <header class="site-header">
    <div class="menu-icon">☰</div>
    <div class="site-title">RETROGRADE DATA BASE</div>
    <div class="search-icon">🔍</div>
  </header>
  <nav id="dropdownMenu" class="dropdown-menu hidden">
    <ul>
      <li><a href="../index.html">Home</a></li>
      <li><a href="index.html">Browse VHS Titles</a></li>
      <li><a href="../genres.html">Genres</a></li>
      <li><a href="../pricing.html">Pricing Info</a></li>
      <li><a href="../submit.html">Submit a Tape</a></li>
      <li><a href="../contact.html">Contact</a></li>
    </ul>
  </nav>
  <main class="home-container">
    <h1 class="main-title">All VHS Titles</h1>
    <p class="subtitle">Browse all indexed VHS releases in the database</p>
    <ul class="titles-list">
${links}
    </ul>
  </main>
</body>
</html>`;
  fs.writeFileSync(INDEX_HTML, html, "utf8");
  console.log(`✅ index.html updated`);
}

function isCorruptedHTML(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return !content.includes("<!DOCTYPE html>") || !content.includes("<title>");
}

function quarantineCorruptTitles() {
  const allFiles = fs
    .readdirSync(TITLES_DIR)
    .filter((f) => f.endsWith(".html") && f !== "index.html");

  allFiles.forEach((file) => {
    const fullPath = path.join(TITLES_DIR, file);
    if (isCorruptedHTML(fullPath)) {
      const quarantinePath = path.join(QUARANTINE_DIR, file);
      fs.renameSync(fullPath, quarantinePath);
      console.log(`⚠️ Moved to quarantine: ${file}`);
    }
  });
}

(async () => {
  const existing = new Set(listExistingTitles());
  let added = 0;

  while (added < MOVIE_COUNT) {
    try {
      const pick = await getRandomMovie();
      const details = await getMovieDetails(pick.id);
      const year = details.release_date?.split("-")[0] || "unknown";
      const filename = slugify(details.title, year);

      if (!existing.has(filename)) {
        createHtml(details, filename);
        existing.add(filename);
        added++;
      } else {
        console.log(`⚠️ Duplicate skipped: ${filename}`);
      }
    } catch (e) {
      console.warn("❌ Fetch error:", e.message || e);
    }
  }

  // Clean bad files first, then update
  quarantineCorruptTitles();
  updateIndexPage([...existing]);
})();