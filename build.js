const fs = require('fs');
const path = require('path');

// Helper to render Strapi v5 Blocks AST to HTML
function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      const textContent = block.children.map(child => child.text).join('');
      return `      <p>${textContent}</p>`;
    }
    return '';
  }).join('\n');
}

async function generateSite() {
  try {
    console.log('Fetching passages from local Strapi...');
    const response = await fetch('http://localhost:1337/api/typikon-passages');
    
    if (!response.ok) {
      throw new Error(`Strapi returned status ${response.status}`);
    }

    const payload = await response.json();
    const passages = payload.data;

    if (!passages || passages.length === 0) {
      console.warn('No published passages found in Strapi.');
      return;
    }

    // Process the first passage (or loop through multiple)
    const passage = passages[0];
    const htmlContent = renderBlocks(passage.full_text);

    const fullHtml = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${passage.title} — Hilandarski Tipik</title>
  <style>
    :root {
      --bg: #fbf9f5;
      --text: #2c2a29;
      --accent: #8c2d19;
      --border: #e2dacd;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: Georgia, serif;
      max-width: 720px;
      margin: 3rem auto;
      padding: 0 1.5rem;
      line-height: 1.8;
    }
    h1 {
      font-size: 2.2rem;
      color: var(--accent);
      margin-bottom: 0.2rem;
    }
    .meta {
      font-style: italic;
      color: #666;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    article p {
      margin-bottom: 1.5rem;
      text-align: justify;
      text-justify: inter-word;
    }
    blockquote {
      border-left: 3px solid var(--accent);
      margin: 2rem 0;
      padding-left: 1rem;
      font-style: italic;
      color: #555;
    }
  </style>
</head>
<body>
  <h1>${passage.title}</h1>
  <div class="meta">${passage.author} — ${passage.source}</div>
  <article>
${htmlContent}
  </article>
  <blockquote>${passage.summary_note}</blockquote>
</body>
</html>`;

    // Ensure output folder exists
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }

    // Write generated static HTML
    fs.writeFileSync(path.join(distDir, 'index.html'), fullHtml, 'utf8');
    console.log('Successfully generated dist/index.html!');

  } catch (err) {
    console.error('Error generating static site:', err.message);
  }
}

generateSite();
