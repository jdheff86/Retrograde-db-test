const fs = require("fs");
const path = require("path");
const https = require("https");

const TMDB_API_KEY = 'af1cc8eba723466ddbf55ab404c953e0';
const MOVIE_COUNT = 6;
const EXISTING_TITLES_FILE = path.join(__dirname, 'existing_titles.json');
const OUTPUT_DIR = path.join(__dirname, 'pages');

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
  return title.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateHTML(movie) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${movie.title} (${movie.year})</title>
</head>
<body style="background-color:#000; color:#fff; font-family:sans-serif;">
  <header style="text-align:center; padding:20px;">
    <h1>${movie.title} (${movie.year})</h1>
    <img src="${movie.poster}" alt="${movie.title}" style="max-width:200px;">
    <p>${movie.overview}</p>
  </header>
</body>
</html>`;
}

async function getRandomVHSMovie() {
  const genreList = [
    { name: 'Action', id: 28 },
    { name: 'Adventure', id: 12 },
    { name: 'Animation', id: 16 },
    { name: 'Comedy', id: 35 },
    { name: 'Crime', id: 80 },
    { name: 'Drama', id: 18 },
    { name: 'Family', id: 10751 },
    { name: 'Fantasy', id: 14 },
    { name: 'Horror', id: 27 },
    { name: 'Mystery', id: 9648 },
    { name: 'Romance', id: 10749 },
    { name: 'Sci-Fi', id: 878 },
    { name: 'Thriller', id: 53 },
    { name: 'Western', id: 37 }
  ];

  const randomGenre = genreList[Math.floor(Math.random() * genreList.length)];
  const randomPage = Math.floor(Math.random() * 500) + 1;
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${randomGenre.id}&sort_by=popularity.desc&page=${randomPage}`;

  const data = await fetchJSON(url);
  const movies = data.results || [];
  const randomIndex = Math.floor(Math.random() * movies.length);
  const movie = movies[randomIndex];

  if (!movie || !movie.title || !movie.release_date) {
    console.log("⚠️  Invalid movie data fetched, skipping.");
    return null;
  }

  const releaseYear = parseInt(movie.release_date.split('-')[0]);
  const slug = slugify(`${movie.title}-${releaseYear}`);
  const outputFile = path.join(OUTPUT_DIR, `${slug}.html`);

  console.log(`🎬 [${randomGenre.name}] Fetched: ${movie.title} (${releaseYear})`);

  if (releaseYear > 2006) {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
      console.log(`🗑️  Deleted post-VHS file: ${slug}.html`);
    } else {
      console.log(`❌ Skipping "${movie.title}" (${releaseYear}) — Post-VHS era`);
    }
    return null;
  }

  return {
    title: movie.title,
    year: releaseYear,
    overview: movie.overview,
    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path || ''}`,
    slug
  };
}

async function main() {
  console.log("🚀 Starting random VHS title generation...");

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log("📁 Created /pages directory");
  }

  let existing = [];
  if (fs.existsSync(EXISTING_TITLES_FILE)) {
    existing = JSON.parse(fs.readFileSync(EXISTING_TITLES_FILE));
  }

  for (let i = 0; i < MOVIE_COUNT; i++) {
    const movie = await getRandomVHSMovie();
    if (!movie) continue;

    if (existing.includes(movie.slug)) {
      console.log(`🔁 Already exists: ${movie.slug}`);
      continue;
    }

    const html = generateHTML(movie);
    const outFile = path.join(OUTPUT_DIR, `${movie.slug}.html`);
    fs.writeFileSync(outFile, html);
    existing.push(movie.slug);

    console.log(`✅ Generated: ${movie.slug}.html`);
  }

  fs.writeFileSync(EXISTING_TITLES_FILE, JSON.stringify(existing, null, 2));
  console.log("✅ Script finished running.");
}

main();