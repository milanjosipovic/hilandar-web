const fs = require('fs');
const path = require('path');

function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      const textContent = block.children.map(child => child.text).join('');
      return `<p>${textContent}</p>`;
    }
    return '';
  }).join('\n');
}

async function generateSite() {
  try {
    console.log('Fetching passages from local Strapi...');
    const response = await fetch('http://localhost:1337/api/typikon-passages');
    
    if (!response.ok) throw new Error(`Strapi status ${response.status}`);

    const payload = await response.json();
    const passage = payload.data[0];

    const modernHtml = renderBlocks(passage.full_text);
    const originalHtml = passage.old_slavonic_text ? renderBlocks(passage.old_slavonic_text) : '';

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
      --muted: #666;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: Georgia, serif;
      max-width: 1100px;
      margin: 3rem auto;
      padding: 0 1.5rem;
      line-height: 1.8;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }
    h1 {
      font-size: 2.2rem;
      color: var(--accent);
      margin-bottom: 0.3rem;
    }
    .meta {
      font-style: italic;
      color: var(--muted);
    }
    /* Parallel Dual-Column Grid */
    .parallel-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      margin-bottom: 3rem;
    }
    .column-title {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }
    article p {
      margin-bottom: 1.5rem;
      text-align: justify;
    }
    blockquote {
      border-left: 3px solid var(--accent);
      margin: 2rem 0;
      padding-left: 1rem;
      font-style: italic;
      color: #555;
    }
    @media (max-width: 768px) {
      .parallel-container {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${passage.title}</h1>
    <div class="meta">${passage.author} — ${passage.source}</div>
  </header>

  <main class="parallel-container">
    <section>
      <div class="column-title">Старословенски текст (Оригинал)</div>
      <article>${originalHtml || '<p><em>Оригинални текст није унет.</em></p>'}</article>
    </section>

    <section>
      <div class="column-title">Савремени превод</div>
      <article>${modernHtml}</article>
    </section>
  </main>

  <blockquote>${passage.summary_note}</blockquote>
</body>
</html>`;

    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

    fs.writeFileSync(path.join(distDir, 'index.html'), fullHtml, 'utf8');
    console.log('Successfully regenerated dist/index.html with parallel text support!');

  } catch (err) {
    console.error('Build error:', err.message);
  }
}

generateSite();
