const fs = require("fs");
const path = require("path");

const TITLES_DIR = path.join(__dirname, "titles");
const QUARANTINE_DIR = path.join(__dirname, "titles_quarantine");

// Create quarantine folder if it doesn't exist
if (!fs.existsSync(QUARANTINE_DIR)) {
  fs.mkdirSync(QUARANTINE_DIR);
  console.log("📁 Created quarantine directory.");
}

fs.readdirSync(TITLES_DIR).forEach((file) => {
  if (file.endsWith(".html") && file !== "index.html") {
    const src = path.join(TITLES_DIR, file);
    const dest = path.join(QUARANTINE_DIR, file);

    fs.renameSync(src, dest);
    console.log(`🧹 Moved to quarantine: ${file}`);
  }
});

console.log("✅ All non-index HTML files safely quarantined.");