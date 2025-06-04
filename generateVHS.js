const fs = require('fs');
const path = require('path');
const https = require('https');

const OMDB_KEY = '9a21eddb'; // ✅ Your real OMDb API key
const titles = ['The Goonies', 'Back to the Future', 'E.T.', 'Jurassic Park', 'Ghostbusters'];

function getRandomTitles(list, count = 5) {
  const shuffled = list.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function fetchMovieData(title) {
  const query = encodeURIComponent(title);
  const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${query}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function generateHTML(movie) {
  const fileSafeTitle = movie.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${movie.Title} - Retrograde DB</title>
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
    <img src="../assets/vhs_placeholder_red_database.png" alt="${movie.Title} VHS" class="main-logo" />
    <h1 class="main-title">${movie.Title}</h1>
    <p class="subtitle">${movie.Year} • Rated ${movie.Rated} • ${movie.Runtime}</p>
    <p class="subtitle">${movie.Genre} | IMDb: ${movie.imdbRating}</p>
    <p class="subtitle">${movie.Plot}</p>
    <a href="index.html" class="cta-button">← Back to Titles</a>
  </main>

  <script src="../scripts/menu.js"></script>
</body>
</html>`;
  const filePath = path.join(__dirname, 'titles', `${fileSafeTitle}.html`);
  fs.writeFileSync(filePath, htmlContent, 'utf8');
  console.log(`✔️ Created: ${fileSafeTitle}.html`);
}

async function generatePages() {
  const selected = getRandomTitles(titles);
  for (const title of selected) {
    try {
      const movie = await fetchMovieData(title);
      if (movie.Response === 'True') {
        generateHTML(movie);
      } else {
        console.warn(`⚠️ Could not fetch: ${title}`);
      }
    } catch (err) {
      console.error(`❌ Error for ${title}:`, err);
    }
  }
}

generatePages();