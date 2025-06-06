const fs = require('fs');
const path = require('path');

const TEMPLATE = fs.readFileSync(
  path.join(__dirname, '../titles/a-nightmare-on-elm-street-part-2-freddy-s-revenge-1985.html'),
  'utf8'
);

const TITLES_DIR = path.join(__dirname, '../titles');

fs.readdirSync(TITLES_DIR).forEach(file => {
  const filePath = path.join(TITLES_DIR, file);

  if (
    path.extname(file) === '.html' &&
    file !== 'index.html' &&
    file !== 'a-nightmare-on-elm-street-part-2-freddy-s-revenge-1985.html'
  ) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Grab title from <h1> line in the original file
    const match = content.match(/<h1 class="main-title">(.*?)<\/h1>/);
    const title = match ? match[1] : 'Unknown Title';

    // Grab the summary from the first <p class="subtitle"> after the h1
    const summaryMatch = content.match(/<p class="subtitle">([\s\S]*?)<\/p>/);
    const summary = summaryMatch ? summaryMatch[1] : '';

    // Replace the core dynamic fields inside the template
    let updated = TEMPLATE
      .replace(/<title>.*?<\/title>/, `<title>${title} - Retrograde DB</title>`)
      .replace(/<h1 class="main-title">.*?<\/h1>/, `<h1 class="main-title">${title}</h1>`)
      .replace(/<p class="subtitle">.*?<\/p>/, `<p class="subtitle">${summary}</p>`);

    // Save it back
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Updated: ${file}`);
  }
});