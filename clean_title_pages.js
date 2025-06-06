const fs = require('fs');
const path = require('path');

const titlesDir = path.join(__dirname, 'titles');

fs.readdirSync(titlesDir).forEach(file => {
  if (file.endsWith('.html') && file !== 'index.html') {
    const filePath = path.join(titlesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const navStart = content.indexOf('<nav id="dropdownMenu"');
    const navEnd = content.indexOf('</nav>', navStart);

    if (navStart !== -1 && navEnd !== -1) {
      const before = content.slice(0, navStart);
      const after = content.slice(navEnd + 7); // 7 = '</nav>'.length
      const cleaned = before + after;

      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`✅ Cleaned: ${file}`);
    } else {
      console.log(`🔍 No cleanup needed: ${file}`);
    }
  }
});