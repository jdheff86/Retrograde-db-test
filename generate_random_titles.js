const fs = require('fs');
const path = require('path');
const https = require('https');

const TMDB_API_KEY = 'af1cc8eba723466ddbf55ab404c953e0'; // Your real TMDB API key
const MOVIE_COUNT = 6;
const EXISTING_TITLES_FILE = path.join(__dirname, 'existing_titles.json');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function loadExistingTitles() {
  if (fs.existsSync(EXISTING_TITLES_FILE)) {
    return JSON.parse(fs.readFileSync(EXISTING_TITLES_FILE, 'utf-8'));
  }
  return [];
}

function saveExistingTitles(titles) {
  fs.writeFileSync(EXISTING_TITLES_FILE, JSON.stringify(titles, null, 2));
}

function generateHTML(movie) {
  const fileSafeTitle = slugify(movie.title + '-' + movie.release_date.slice(0, 4));
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
    <img src="../assets/vhs_placeholder_red_database.png" alt="${movie.title} VHS" class="main-logo" />
    <h1 class="main-title">${movie.title}</h1>
    <p class="subtitle">${movie.release_date.slice(0, 4)} • TMDB Rating: ${movie.vote_average}</p>
    <p class="subtitle">${movie.overview}</p>
    <a href="index.html" class="cta-button">← Back to Titles</a>
  </main>

  <script src="../scripts/menu.js"></script>
</body>
</html>`;

  const filePath = path.join(__dirname, 'titles', `${fileSafeTitle}.html`);
  fs.writeFileSync(filePath, htmlContent, 'utf8');
  console.log(`✅ Created: ${fileSafeTitle}.html`);
}

async function getRandomMovies(count) {
  const page = Math.floor(Math.random() * 100) + 1;
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`;
  const data = await fetchJSON(url);
  return data.results.slice(0, count);
}

async function generatePages() {
  const existing = loadExistingTitles();
  const newMovies = await getRandomMovies(MOVIE_COUNT);

  for (const movie of newMovies) {
    const uniqueID = `${movie.title} (${movie.release_date.slice(0, 4)})`;

    const isDuplicate = existing.some(
      (e) => e.title === movie.title && e.year === movie.release_date.slice(0, 4)
    );

    if (isDuplicate) {
      console.log(`⚠️ Skipping duplicate: ${uniqueID}`);
      continue;
    }

    generateHTML(movie);
    existing.push({ title: movie.title, year: movie.release_date.slice(0, 4) });
  }

  saveExistingTitles(existing);
}

generatePages();