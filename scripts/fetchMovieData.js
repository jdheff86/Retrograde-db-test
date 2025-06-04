// scripts/fetchMovieData.js

document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "9a21eddb";

  const movies = [
    { id: "elf", title: "Elf" },
    { id: "happy-gilmore", title: "Happy Gilmore" },
    { id: "shrek", title: "Shrek" },
    { id: "step-brothers", title: "Step Brothers" },
    { id: "the-mask", title: "The Mask" }
  ];

  movies.forEach(movie => {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movie.title)}&apikey=${apiKey}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.Response === "True") {
          const container = document.getElementById(`${movie.id}-details`);
          if (container) {
            container.innerHTML = `
              <p><strong>Year:</strong> ${data.Year}</p>
              <p><strong>Genre:</strong> ${data.Genre}</p>
              <p><strong>Director:</strong> ${data.Director}</p>
              <p><strong>Actors:</strong> ${data.Actors}</p>
              <p><strong>Plot:</strong> ${data.Plot}</p>
              <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
            `;
          }
        } else {
          console.warn(`Could not load data for ${movie.title}: ${data.Error}`);
        }
      })
      .catch(err => console.error(`Fetch failed for ${movie.title}:`, err));
  });
});