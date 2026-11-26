// Builds the blog from blog/posts/*.md: one page per post at blog/<name>.html, and the list at
// blog.html, plus the RSS feed at feed.xml. A post starts with front matter (title, date, summary,
// and an optional image for the list). Run after editing a post:
//   node scripts/build-blog.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "./marked.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = join(ROOT, "blog", "posts");
const CSS = "/style.css?v=66";
const SITE = "https://rk68.github.io";
const BLOG_DESCRIPTION = "Writing on agents and how I build software with them.";
// Draws ```mermaid blocks in the browser, in the site's colours. Loaded only on pages that have one.
const MERMAID = `<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: {
    darkMode: true, background: "#000000", fontFamily: getComputedStyle(document.body).fontFamily,
    primaryColor: "#0d1117", primaryTextColor: "#f2f2f2", primaryBorderColor: "#2a2a30",
    lineColor: "#5cc8ff", secondaryColor: "#0d1117", tertiaryColor: "#06080b",
    clusterBkg: "#06080b", clusterBorder: "#2a2a30", edgeLabelBackground: "#000000" } });
</script>`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const longDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// `title` is the bare name. The browser tab adds the site name, the link preview does not.
function page({ title, description, path, type = "website", body, extra = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · Rishi Kalra</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${path}">
  <link rel="alternate" type="application/rss+xml" title="Rishi Kalra · Blog" href="/feed.xml">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Rishi Kalra">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}${path}">
  <meta property="og:image" content="${SITE}/media/og/default.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#fff9ed">
  <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${CSS}">
  <script src="/site.js?v=1"></script>
</head>
<body>
  <header>
    <a href="/">Rishi Kalra</a>
    <nav aria-label="Site"><a href="/projects.html">Projects</a><a href="/research.html">Research</a><a href="/blog.html" aria-current="page">Blog</a><a href="/bookshelf.html">Books</a></nav>
  </header>
  <main>
${body}
  </main>
  <footer><div data-contacts></div></footer>${extra}
</body>
</html>
`;
}

function parse(file) {
  const text = readFileSync(join(POSTS, file), "utf8");
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) throw new Error(`${file}: no front matter`);
  const meta = Object.fromEntries(m[1].split("\n").map((l) => l.split(/:\s(.*)/s).slice(0, 2).map((x) => x.trim())));
  for (const key of ["title", "date", "summary"]) if (!meta[key]) throw new Error(`${file}: no ${key}`);
  return { ...meta, name: file.replace(/\.md$/, ""), markdown: text.slice(m[0].length) };
}

// A ```mermaid block becomes a diagram; the source stays in the page for readers without JavaScript.
const renderer = new marked.Renderer();
const code = renderer.code.bind(renderer);
renderer.code = (token) => (token.lang === "mermaid" ? `<pre class="mermaid">${esc(token.text)}</pre>\n` : code(token));
// Tables scroll sideways on narrow screens.
renderer.table = ((table) => (token) => `<div class="table-wrap">${table(token)}</div>`)(renderer.table.bind(renderer));

const posts = readdirSync(POSTS).filter((f) => f.endsWith(".md")).map(parse).sort((a, b) => b.date.localeCompare(a.date));
for (const post of posts) {
  const html = marked.parse(post.markdown, { renderer, gfm: true });
  const body = `    <article class="post">
      <p class="post-meta muted"><a href="/blog.html">Blog</a> · <time datetime="${post.date}">${longDate(post.date)}</time></p>
      <h1>${esc(post.title)}</h1>
      <p class="post-lede">${esc(post.summary)}</p>
${html}
    </article>`;
  writeFileSync(join(ROOT, "blog", `${post.name}.html`), page({
    title: post.title, description: post.summary, path: `/blog/${post.name}.html`, type: "article", body,
    extra: post.markdown.includes("```mermaid") ? `\n  ${MERMAID}` : "",
  }));
}

// Each row is the post's picture, its title and summary, then the date. A post without an image gets
// an empty cell so the titles still line up.
const list = posts.map((p) => `      <li>
        ${p.image ? `<img class="row-thumb" src="${esc(p.image)}" width="480" height="300" alt="" loading="lazy">` : '<span class="row-thumb"></span>'}
        <div>
          <a class="title" href="/blog/${p.name}.html">${esc(p.title)}</a>
          <div class="muted">${esc(p.summary)}</div>
        </div>
        <div class="muted"><time datetime="${p.date}">${longDate(p.date)}</time></div>
      </li>`).join("\n");
writeFileSync(join(ROOT, "blog.html"), page({
  title: "Blog", description: BLOG_DESCRIPTION, path: "/blog.html",
  body: `    <h1>Blog</h1>
    <p class="muted"><a href="/feed.xml">RSS feed</a></p>
    <ul class="items link-rows">
${list}
    </ul>`,
}));
const items = posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.name}.html</link>
      <guid>${SITE}/blog/${p.name}.html</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`).join("\n");
writeFileSync(join(ROOT, "feed.xml"), `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rishi Kalra · Blog</title>
    <link>${SITE}/blog.html</link>
    <description>${BLOG_DESCRIPTION}</description>
    <language>en-gb</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`);
console.log(`built ${posts.length} post(s), blog.html and feed.xml`);
