const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "titles", "a-nightmare-on-elm-street.html");
const outputDir = path.join(__dirname, "titles");

const titleData = [
  {
    slug: "castle-in-the-sky",
    title: "Castle in the Sky",
    date: "1986-08-02",
    rating: "7.974",
    description: "A young boy and a girl with a magic crystal must race against pirates and foreign agents in a search for a legendary floating castle."
  },
  {
    slug: "apocalypse-now",
    title: "Apocalypse Now",
    date: "1979",
    rating: "8.271",
    description: `At the height of the Vietnam war, Captain Benjamin Willard is sent on a dangerous mission that, officially, "does not exist."`
  },
  {
    slug: "back-to-the-future",
    title: "Back to the Future",
    date: "1985",
    rating: "8.5",
    description: "Marty McFly is sent 30 years into the past in a DeLorean invented by Doc Brown."
  }
  // Add more here if needed
];

const template = fs.readFileSync(templatePath, "utf-8");

titleData.forEach(({ slug, title, date, rating, description }) => {
  const filePath = path.join(outputDir, `${slug}.html`);
  const content = template
    .replace(/A Nightmare on Elm Street/g, title)
    .replace(/1984 • Rating: 7.3/g, `${date} • Rating: ${rating}`)
    .replace(/A teenager discovers that he can control his dreams/g, description)
    .replace(/alt="A Nightmare on Elm Street VHS"/g, `alt="${title} VHS"`)
    .replace(/<title>.*?<\/title>/, `<title>${title} - Retrograde DB</title>`);
    
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Created: ${filePath}`);
});