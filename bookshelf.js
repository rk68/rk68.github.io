import { categories } from "/books.mjs?v=9";

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
  li.className = book.reading ? "book reading" : "book";
  li.style.cssText = `--bg:${book.bg};--fg:${book.fg};--h:${height}rem;--spine:${spine}rem;--cover:${cover}rem;--open:${open}rem;--tilt:${-TILT}deg`;
  li.innerHTML = `<button type="button" aria-expanded="false" aria-label="${esc(book.title)} by ${esc(book.author)}${book.reading ? ", currently reading" : ""}">
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

// One shelf, laid out in rows. A labelled divider starts each category. Each row keeps an empty
// stretch at its end as wide as the widest cover, so an opening book pushes only the rest of its
// own row along and never moves a book onto another row.
const root = document.querySelector("[data-shelves]");
const shelf = document.createElement("div");
shelf.className = "shelf";
const items = [];
let reserve = 0; // rem
for (const category of categories) {
  const divider = document.createElement("li");
  divider.className = "divider";
  divider.innerHTML = `<b>${category.books.length}</b><span>${esc(category.name)}</span>`;
  divider.width = 3; // card plus margins, in rem, as set in style.css
  items.push(divider);
  for (const book of category.books) {
    const li = render(book);
    const { spine, open } = size(book);
    li.width = spine;
    reserve = Math.max(reserve, open - spine);
    items.push(li);
  }
}
const caption = document.createElement("p");
caption.className = "shelf-caption";
caption.setAttribute("aria-live", "polite");
root.append(shelf, caption);

const GAP = 3; // px between items, as set in style.css
let laidOutWidth = 0;
function layout() {
  const width = shelf.clientWidth;
  if (width === laidOutWidth) return;
  laidOutWidth = width;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const limit = width - reserve * rem;
  const rows = [[]];
  let used = 0;
  for (const item of items) {
    const w = item.width * rem + GAP;
    let row = rows.at(-1);
    if (row.length && used + w > limit) {
      // A divider never ends a row: it moves down with its first book.
      const carry = row.at(-1).classList.contains("divider") ? [row.pop()] : [];
      rows.push(carry);
      row = carry;
      used = carry.reduce((n, it) => n + it.width * rem + GAP, 0);
    }
    row.push(item);
    used += w;
  }
  shelf.replaceChildren(...rows.map((row) => {
    const ul = document.createElement("ul");
    ul.className = "shelf-row";
    ul.append(...row);
    return ul;
  }));
}
layout();
new ResizeObserver(layout).observe(shelf);

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
  }
  current = li === current ? null : li;
  caption.textContent = "";
  if (!current) return;
  const { book } = current;
  current.classList.add("open");
  current.querySelector("button").setAttribute("aria-expanded", "true");
  caption.innerHTML = `<span class="me">${esc(book.title)}</span> <span class="muted">${esc(book.author)}, ${book.year}${book.reading ? " · Currently reading" : ""}</span>`;
}

root.addEventListener("click", (e) => {
  const li = e.target.closest(".book");
  if (li) select(li);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && current) select(current);
});
