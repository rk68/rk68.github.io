// Downloads a cover for each book in books.mjs to media/books/<slug>.jpg. It tries the Apple Books
// search first and Open Library second. Existing files are kept, so a wrong cover can be replaced
// by hand: delete the file and run again, or drop in your own image. Run:
//   node scripts/fetch-covers.mjs
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categories } from "../books.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "media", "books");
mkdirSync(OUT, { recursive: true });

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const get = (url) => fetch(url, { signal: AbortSignal.timeout(20000) });

// Apple returns several editions. Take the one whose title and author match, never a box set.
async function apple(book, surname) {
  const term = encodeURIComponent(book.search ?? `${book.title.split(":")[0]} ${surname}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=ebook&entity=ebook&limit=10`;
  let res = await get(url);
  // Apple rate-limits quick runs of searches. Wait once and retry.
  if (!res.ok) { await new Promise((r) => setTimeout(r, 15000)); res = await get(url); }
  const { results } = await res.json();
  const title = norm(book.title.split(":")[0]);
  const hit = results.find((r) => norm(r.trackName).startsWith(title) && norm(r.artistName).includes(norm(surname)) && !/collection|box set|books \d/i.test(r.trackName));
  return hit?.artworkUrl100?.replace(/\/\d+x\d+bb\./, "/1000x1000bb.");
}

async function openLibrary(book, author) {
  const query = new URLSearchParams({ title: book.title, author, fields: "cover_i", limit: "5" });
  const { docs } = await (await get(`https://openlibrary.org/search.json?${query}`)).json();
  const id = docs.find((d) => d.cover_i)?.cover_i;
  return id && `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
}

const why = (err) => err.cause?.code ?? err.message;

for (const book of categories.flatMap((s) => s.books)) {
  const file = join(OUT, `${book.slug}.jpg`);
  if (existsSync(file)) continue;
  const author = book.author.split(/ and | with /)[0];
  const surname = author.split(" ").pop();
  let saved = false;
  const errors = [];
  for (const [name, source] of [["Apple", apple], ["Open Library", openLibrary]]) {
    try {
      const url = await source(book, name === "Apple" ? surname : author);
      if (!url) { errors.push(`${name}: no match`); continue; }
      const res = await get(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      console.log(`saved   ${book.title} (${name})`);
      saved = true;
      break;
    } catch (err) {
      errors.push(`${name}: ${why(err)}`);
    }
  }
  if (!saved) console.log(`missing ${book.title}: ${errors.join(", ")}`);
}
