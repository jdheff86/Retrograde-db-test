const fs = require("fs");
const path = require("path");
const https = require("https");

const TMDB_API_KEY = 'af1cc8eba723466ddbf55ab404c953e0'; // ✅ Your real TMDB API key
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

async function getRandomComedyMovie() {
  const randomPage = Math.floor(Math.random() * 500) + 1;
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&