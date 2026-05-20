const fs = require('fs');
const path = require('path');

// Markdown'ı parse et (basit, harici kütüphane gerektirmez)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    meta[key] = val;
  });
  
  return { meta, body: match[2] };
}

// Basit markdown → HTML
function markdownToHtml(md) {
  return md
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|u|o])/gm, '')
    .replace(/^<\/p><p>(<h[23]>)/gm, '$1')
    .trim();
}

// _posts klasöründeki tüm .md dosyaları oku
const postsDir = path.join(__dirname, '_posts');
const posts = [];

if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // En yeni önce

  files.forEach(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { meta, body } = parseFrontmatter(content);
    if (meta.draft === 'true') return;
    
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
    posts.push({ ...meta, slug, body, file });
  });
}

// blog/index.html oluştur
const CATS = {
  'visual-identity': 'Visual Identity',
  'brand-strategy': 'Brand Strategy',
  'print-design': 'Print Design',
  'web-design': 'Web Design',
  'music-video': 'Music Video',
  'ipuclari': 'Sektör İpuçları',
};

const postCards = posts.map(p => `
  <a class="blog-card" href="/blog/${p.slug}.html">
    <div class="blog-card-img" style="${p.thumbnail ? `background-image:url(${p.thumbnail})` : 'background: var(--burgundy)'}"></div>
    <div class="blog-card-body">
      <div class="blog-meta">
        <span class="blog-cat">${CATS[p.category] || p.category}</span>
        <span class="blog-date">${p.date}</span>
      </div>
      <h2 class="blog-title">${p.title}</h2>
      <p class="blog-excerpt">${p.excerpt}</p>
      <span class="blog-read">Devamını Oku →</span>
    </div>
  </a>`).join('');

const NAV = `<nav>
  <div class="nav-logo"><a href="/index.html"><img src="/logo-text.png" alt="serksahin design studio" /></a></div>
  <ul class="nav-links">
    <li><a href="/index.html#services">Hizmetler</a></li>
    <li><a href="/portfolio.html">Portföy</a></li>
    <li><a href="/video.html">Video</a></li>
    <li><a href="/webdesign.html">Web Design</a></li>
    <li><a href="/blog/index.html" class="active">Blog</a></li>
    <li><a href="/contact.html">İletişim</a></li>
  </ul>
  <div class="hamburger" id="hamburger" onclick="toggleNav()">
    <span></span><span></span><span></span>
  </div>
</nav>`;

const blogIndex = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog — serksahin | Visual Identity | Premium Branding | Print Design</title>
<meta name="description" content="Marka kimliği, tasarım stratejisi, baskı çözümleri ve yaratıcı endüstri üzerine içgörüler.">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@300,400,500,600,700&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --cream: #EFE6DA; --sand: #D8C6AE; --charcoal: #2B2B2B;
    --bronze: #A97449; --warm-gray: #8B8B8B;
    --burgundy: #4B1E24; --burgundy-pale: #f5eced;
    --font-d: 'ClashGrotesk','Inter',sans-serif; --font-b: 'Inter',sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--cream); color: var(--charcoal); font-family: var(--font-b); }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 4rem; background: var(--burgundy); border-bottom: 1px solid rgba(169,116,73,0.25); }
  .nav-logo img { height: 26px; display: block; filter: brightness(1.15); }
  .nav-links { display: flex; gap: 2.5rem; list-style: none; }
  .nav-links a { font-family: var(--font-d); font-size: 10px; font-weight: 500; letter-spacing: 0.2em; color: rgba(239,230,218,0.6); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
  .nav-links a:hover, .nav-links a.active { color: var(--bronze); }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; z-index: 300; }
  .hamburger span { display: block; width: 24px; height: 2px; background: var(--cream); transition: all 0.3s; }

  .page-hero { background: var(--burgundy); padding: 10rem 4rem 5rem; position: relative; overflow: hidden; }
  .page-hero::after { content: ''; position: absolute; top: -80px; right: -80px; width: 400px; height: 400px; border: 1px solid rgba(169,116,73,0.1); border-radius: 50%; pointer-events: none; }
  .page-eyebrow { font-family: var(--font-d); font-size: 9px; letter-spacing: 0.4em; color: var(--bronze); text-transform: uppercase; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; }
  .page-eyebrow::before { content: ''; display: block; width: 40px; height: 1px; background: var(--bronze); }
  .page-title { font-family: var(--font-d); font-size: clamp(2.5rem,5vw,4rem); font-weight: 300; color: var(--cream); letter-spacing: -0.02em; }
  .page-title em { font-style: italic; color: var(--bronze); }
  .page-desc { font-size: 13px; color: rgba(239,230,218,0.5); line-height: 1.8; margin-top: 1.5rem; max-width: 500px; font-weight: 300; }

  .blog-grid { padding: 4rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .blog-card { background: var(--cream); border: 1px solid rgba(43,43,43,0.08); text-decoration: none; display: flex; flex-direction: column; transition: border-color 0.3s; }
  .blog-card:hover { border-color: var(--burgundy); }
  .blog-card-img { height: 220px; background: var(--sand); overflow: hidden; position: relative; }
  .blog-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
  .blog-card:hover .blog-card-img img { transform: scale(1.04); }
  .blog-card-body { padding: 2rem; flex: 1; display: flex; flex-direction: column; }
  .blog-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .blog-cat { font-family: var(--font-d); font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--bronze); background: var(--burgundy-pale); padding: 0.3rem 0.7rem; }
  .blog-date { font-family: var(--font-d); font-size: 8px; letter-spacing: 0.1em; color: var(--warm-gray); }
  .blog-title { font-family: var(--font-d); font-size: 1.05rem; font-weight: 500; color: var(--charcoal); line-height: 1.35; margin-bottom: 0.8rem; }
  .blog-excerpt { font-size: 12px; color: var(--warm-gray); line-height: 1.7; font-weight: 300; flex: 1; }
  .blog-read { font-family: var(--font-d); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--burgundy); margin-top: 1.5rem; display: block; transition: letter-spacing 0.3s; }
  .blog-card:hover .blog-read { letter-spacing: 0.3em; }

  .empty-blog { padding: 6rem 4rem; text-align: center; }
  .empty-blog p { font-family: var(--font-d); font-size: 1rem; color: var(--warm-gray); font-weight: 300; }

  footer { background: var(--charcoal); padding: 2rem 4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); }
  .footer-logo img { height: 28px; display: block; filter: brightness(1.15); }
  .footer-copy { font-size: 11px; color: rgba(139,139,139,0.4); font-family: var(--font-d); letter-spacing: 0.1em; }

  @media (max-width: 1024px) { .blog-grid { grid-template-columns: repeat(2,1fr); padding: 3rem 2rem; } nav { padding: 1.2rem 2rem; } footer { padding: 1.5rem 2rem; } .page-hero { padding: 8rem 2rem 4rem; } }
  @media (max-width: 768px) {
    .hamburger { display: flex; }
    .nav-links { display: none; flex-direction: column; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--burgundy); align-items: center; justify-content: center; gap: 2rem; z-index: 200; }
    .nav-links.open { display: flex; }
    .nav-links a { font-size: 14px; }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }
    .blog-grid { grid-template-columns: 1fr; padding: 2rem 1.5rem; }
    .page-hero { padding: 7rem 1.5rem 3rem; }
    footer { padding: 1.2rem 1.5rem; flex-direction: column; gap: 0.5rem; text-align: center; }
  }
</style>
</head>
<body>
${NAV}
<div class="page-hero">
  <div class="page-eyebrow">Blog</div>
  <h1 class="page-title">Tasarım &<br><em>Strateji</em></h1>
  <p class="page-desc">Marka kimliği, baskı tasarımı, web ve müzik videosu prodüksiyonu üzerine içgörüler, ipuçları ve sektör bakış açıları.</p>
</div>

<div class="blog-grid">
  ${postCards || '<div class="empty-blog"><p>Henüz blog yazısı yok.<br>Admin panelinden ilk yazını ekle.</p></div>'}
</div>

<footer>
  <div class="footer-logo"><a href="/index.html"><img src="/logo-text.png" alt="serksahin design studio" /></a></div>
  <div class="footer-copy">© 2026 — Istanbul, Türkiye</div>
</footer>
<script>
  function toggleNav() {
    document.querySelector('.nav-links').classList.toggle('open');
    document.getElementById('hamburger').classList.toggle('open');
  }
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
  }));
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'blog', 'index.html'), blogIndex);
console.log(`Blog index oluşturuldu: ${posts.length} yazı`);

// Her yazı için ayrı HTML sayfası oluştur
posts.forEach(p => {
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${p.seo_title || p.title} | Serksahin Design Studio</title>
<meta name="description" content="${p.seo_description || p.excerpt}">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.excerpt}">
${p.thumbnail ? `<meta property="og:image" content="${p.thumbnail}">` : ''}
<meta property="og:type" content="article">
<link rel="canonical" href="https://serksahin.com/blog/${p.slug}.html">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@300,400,500,600,700&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --cream: #EFE6DA; --sand: #D8C6AE; --charcoal: #2B2B2B; --bronze: #A97449; --warm-gray: #8B8B8B; --burgundy: #4B1E24; --burgundy-pale: #f5eced; --font-d: 'ClashGrotesk','Inter',sans-serif; --font-b: 'Inter',sans-serif; }
  body { background: var(--cream); color: var(--charcoal); font-family: var(--font-b); }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 4rem; background: var(--burgundy); border-bottom: 1px solid rgba(169,116,73,0.25); }
  .nav-logo img { height: 26px; display: block; filter: brightness(1.15); }
  .nav-links { display: flex; gap: 2.5rem; list-style: none; }
  .nav-links a { font-family: var(--font-d); font-size: 10px; font-weight: 500; letter-spacing: 0.2em; color: rgba(239,230,218,0.6); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
  .nav-links a:hover, .nav-links a.active { color: var(--bronze); }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; z-index: 300; }
  .hamburger span { display: block; width: 24px; height: 2px; background: var(--cream); transition: all 0.3s; }

  .post-hero { background: var(--burgundy); padding: 9rem 4rem 4rem; position: relative; overflow: hidden; }
  .post-back { font-family: var(--font-d); font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(239,230,218,0.5); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; transition: color 0.3s; }
  .post-back:hover { color: var(--bronze); }
  .post-cat { font-family: var(--font-d); font-size: 9px; letter-spacing: 0.3em; color: var(--bronze); text-transform: uppercase; margin-bottom: 1rem; }
  .post-title { font-family: var(--font-d); font-size: clamp(1.8rem,4vw,3.2rem); font-weight: 300; color: var(--cream); letter-spacing: -0.02em; line-height: 1.15; max-width: 700px; }
  .post-date { font-family: var(--font-d); font-size: 9px; letter-spacing: 0.2em; color: rgba(239,230,218,0.4); text-transform: uppercase; margin-top: 1.5rem; }

  .post-thumbnail { width: 100%; max-height: 480px; object-fit: cover; display: block; }

  .post-body { max-width: 720px; margin: 0 auto; padding: 4rem 2rem; }
  .post-body h2 { font-family: var(--font-d); font-size: 1.4rem; font-weight: 500; color: var(--burgundy); margin: 2.5rem 0 1rem; letter-spacing: -0.01em; }
  .post-body h3 { font-family: var(--font-d); font-size: 1.1rem; font-weight: 500; color: var(--charcoal); margin: 2rem 0 0.8rem; }
  .post-body p { font-size: 15px; color: #444; line-height: 1.9; margin-bottom: 1.4rem; font-weight: 300; }
  .post-body strong { color: var(--charcoal); font-weight: 500; }
  .post-body em { font-style: italic; color: var(--burgundy); }

  .post-footer { border-top: 1px solid rgba(43,43,43,0.1); padding: 2rem; text-align: center; }
  .post-footer a { font-family: var(--font-d); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--burgundy); text-decoration: none; border: 1px solid rgba(75,30,36,0.3); padding: 0.8rem 2rem; display: inline-block; transition: all 0.3s; }
  .post-footer a:hover { background: var(--burgundy); color: var(--cream); }

  footer { background: var(--charcoal); padding: 2rem 4rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); }
  .footer-logo img { height: 28px; display: block; filter: brightness(1.15); }
  .footer-copy { font-size: 11px; color: rgba(139,139,139,0.4); font-family: var(--font-d); letter-spacing: 0.1em; }

  @media (max-width: 768px) {
    .hamburger { display: flex; }
    .nav-links { display: none; flex-direction: column; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--burgundy); align-items: center; justify-content: center; gap: 2rem; z-index: 200; }
    .nav-links.open { display: flex; }
    .nav-links a { font-size: 14px; }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }
    nav { padding: 1.2rem 1.5rem; }
    .post-hero { padding: 7rem 1.5rem 3rem; }
    .post-body { padding: 3rem 1.5rem; }
    footer { padding: 1.2rem 1.5rem; flex-direction: column; gap: 0.5rem; }
  }
</style>
</head>
<body>
${NAV.replace('class="active"', '').replace('/blog/index.html">', '/blog/index.html" class="active">')}
<div class="post-hero">
  <a class="post-back" href="/blog/index.html">← Blog'a Dön</a>
  <div class="post-cat">${CATS[p.category] || p.category}</div>
  <h1 class="post-title">${p.title}</h1>
  <div class="post-date">${p.date}</div>
</div>
${p.thumbnail ? `<img class="post-thumbnail" src="${p.thumbnail}" alt="${p.title}">` : ''}
<div class="post-body">
  <p>${p.body.replace(/^## /gm, '</p><h2>').replace(/\n## /g, '</h2><p>').replace(/^### /gm, '</p><h3>').replace(/\n### /g, '</h3><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>')}</p>
</div>
<div class="post-footer">
  <a href="/blog/index.html">← Tüm Yazılara Dön</a>
</div>
<footer>
  <div class="footer-logo"><a href="/index.html"><img src="/logo-text.png" alt="serksahin design studio" /></a></div>
  <div class="footer-copy">© 2026 — Istanbul, Türkiye</div>
</footer>
<script>
  function toggleNav() { document.querySelector('.nav-links').classList.toggle('open'); document.getElementById('hamburger').classList.toggle('open'); }
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => { document.querySelector('.nav-links').classList.remove('open'); document.getElementById('hamburger').classList.remove('open'); }));
</script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(__dirname, 'blog', `${p.slug}.html`), html);
  console.log(`  → /blog/${p.slug}.html`);
});

console.log('Build tamamlandı!');
