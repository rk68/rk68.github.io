import { shelves } from "/books.mjs?v=6";

// Each book is a 3D box: the spine faces the reader and the cover is hinged on its right edge,
// turned 90 degrees away. Opening a book turns the box so the cover faces the reader.
const TILT = 62; // degrees the open book turns

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// Spines carry the first author's surname, as printed books do.
const surname = (author) => author.split(/ and | with /)[0].split(" ").pop();

function size(book) {
  // Heights vary a little per book, as on a real shelf. The hash keeps each height stable.
  const hash = [...book.slug].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 997, 7);
  const height = 15 + (hash % 6) * 0.35;
  const spine = Math.min(3.6, 1.7 + book.pages / 560);
  const cover = height * 0.66;
  const rad = (TILT * Math.PI) / 180;
  const open = spine * Math.cos(rad) + cover * Math.sin(rad);
  return { height, spine, cover, open };
}

function render(book) {
  const { height, spine, cover, open } = size(book);
  const li = document.createElement("li");
  li.className = "book";
  li.style.cssText = `--bg:${book.bg};--fg:${book.fg};--h:${height}rem;--spine:${spine}rem;--cover:${cover}rem;--open:${open}rem;--tilt:${-TILT}deg`;
  li.innerHTML = `<button type="button" aria-expanded="false" aria-label="${esc(book.title)} by ${esc(book.author)}">
    <span class="book-box">
      <span class="spine"><span class="spine-title">${esc(book.title)}</span><span class="spine-author">${esc(surname(book.author))}</span></span>
      <span class="cover"><span class="cover-title">${esc(book.title)}</span><span class="cover-author">${esc(book.author)}</span></span>
    </span>
  </button>`;
  // A downloaded cover image replaces the drawn cover. Without one, the drawn cover stays.
  const img = new Image();
  img.className = "cover-img";
  img.alt = "";
  img.decoding = "async";
  img.onload = () => li.querySelector(".cover").append(img);
  img.src = `/media/books/${book.slug}.jpg`;
  li.book = book;
  return li;
}

const root = document.querySelector("[data-shelves]");
for (const shelf of shelves) {
  const section = document.createElement("section");
  section.innerHTML = `<h2>${esc(shelf.name)}</h2><ul class="shelf"></ul><p class="shelf-caption" aria-live="polite"></p>`;
  section.querySelector(".shelf").append(...shelf.books.map(render));
  root.append(section);
}

// A title too long for its spine drops to a smaller size, as printed spines do.
// Measure again once Inter loads, because the fallback font is narrower.
function fitSpines() {
  const text = document.createRange();
  for (const title of root.querySelectorAll(".spine-title:not(.long)")) {
    text.selectNodeContents(title);
    if (text.getBoundingClientRect().height > title.getBoundingClientRect().height + 0.5) title.classList.add("long");
  }
}
fitSpines();
document.fonts.ready.then(fitSpines);

let current = null;
function select(li) {
  if (current) {
    current.classList.remove("open");
    current.querySelector("button").setAttribute("aria-expanded", "false");
    current.closest("section").querySelector(".shelf-caption").textContent = "";
  }
  current = li === current ? null : li;
  if (!current) return;
  const { book } = current;
  current.classList.add("open");
  current.querySelector("button").setAttribute("aria-expanded", "true");
  const caption = current.closest("section").querySelector(".shelf-caption");
  caption.innerHTML = `<span class="me">${esc(book.title)}</span> <span class="muted">${esc(book.author)}, ${book.year}</span>`;
  // Wait for the book to widen, then scroll the shelf sideways (never the page) to show it all.
  const target = current;
  setTimeout(() => {
    const shelf = target.parentElement;
    const left = target.offsetLeft - shelf.offsetLeft;
    const over = left + target.offsetWidth - (shelf.scrollLeft + shelf.clientWidth);
    if (over > 0) shelf.scrollBy({ left: over + 8, behavior: "smooth" });
    else if (left < shelf.scrollLeft) shelf.scrollTo({ left, behavior: "smooth" });
  }, 450);
}

root.addEventListener("click", (e) => {
  const li = e.target.closest(".book");
  if (li) select(li);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && current) select(current);
});
