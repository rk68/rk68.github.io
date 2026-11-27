// The bookshelf: one shelf, grouped by category, with a labelled divider before each group.
// Used by bookshelf.js in the browser and by scripts/fetch-covers.mjs, which saves each cover
// to media/books/<slug>.jpg. `pages` sets the spine width. `bg` (each cover's main colour) and
// `fg` colour the spine. `search` overrides the cover search when the title alone finds nothing.
// `reading: true` marks a book I am reading now. A category with `upcoming: true` holds books I
// have not read yet, and its divider has its own style.
export const categories = [
  {
    name: "AI",
    books: [
      { slug: "superintelligence", title: "Superintelligence", author: "Nick Bostrom", year: 2014, pages: 352, bg: "#ffffff", fg: "#1c1c1c" },
      { slug: "the-thinking-machine", title: "The Thinking Machine", author: "Stephen Witt", year: 2025, pages: 272, bg: "#2fd42f", fg: "#1c1c1c" },
      { slug: "the-infinity-machine", title: "The Infinity Machine", author: "Sebastian Mallaby", year: 2026, pages: 400, bg: "#081a86", fg: "#f4efe6" },
      { slug: "homo-deus", title: "Homo Deus", author: "Yuval Noah Harari", year: 2015, pages: 448, bg: "#0a0607", fg: "#f4efe6" },
    ],
  },
  {
    name: "Startups",
    books: [
      { slug: "zero-to-one", title: "Zero to One", author: "Peter Thiel with Blake Masters", year: 2014, pages: 224, bg: "#7192b8", fg: "#1c1c1c" },
      { slug: "the-lean-startup", title: "The Lean Startup", author: "Eric Ries", year: 2011, pages: 336, bg: "#007ec3", fg: "#f4efe6" },
      { slug: "the-everything-store", title: "The Everything Store", author: "Brad Stone", year: 2013, pages: 384, bg: "#fffefe", fg: "#1c1c1c" },
      { slug: "facebook-the-inside-story", title: "Facebook: The Inside Story", author: "Steven Levy", year: 2020, pages: 608, bg: "#035ca5", fg: "#f4efe6" },
      { slug: "bad-blood", title: "Bad Blood", author: "John Carreyrou", year: 2018, pages: 352, bg: "#080702", fg: "#f4efe6" },
      { slug: "liftoff", title: "Liftoff", author: "Eric Berger", year: 2021, pages: 288, bg: "#070705", fg: "#f4efe6" },
      { slug: "elon-musk-vance", title: "Elon Musk", author: "Ashlee Vance", year: 2015, pages: 400, bg: "#141315", fg: "#f4efe6" },
    ],
  },
  {
    name: "Power",
    books: [
      { slug: "the-technological-republic", title: "The Technological Republic", author: "Alexander C. Karp and Nicholas W. Zamiska", year: 2025, pages: 320, bg: "#cde9f1", fg: "#1c1c1c" },
      { slug: "permanent-record", title: "Permanent Record", author: "Edward Snowden", year: 2019, pages: 352, bg: "#f9f9f9", fg: "#1c1c1c" },
      { slug: "the-age-of-surveillance-capitalism", title: "The Age of Surveillance Capitalism", author: "Shoshana Zuboff", year: 2019, pages: 704, bg: "#fffce9", fg: "#1c1c1c" },
      { slug: "the-dead-hand", title: "The Dead Hand", author: "David E. Hoffman", year: 2009, pages: 577, bg: "#3893a5", fg: "#f4efe6" },
      { slug: "the-world-for-sale", title: "The World for Sale", author: "Javier Blas and Jack Farchy", year: 2021, pages: 416, bg: "#010000", fg: "#f4efe6" },
    ],
  },
  {
    name: "History",
    books: [
      { slug: "sapiens", title: "Sapiens", author: "Yuval Noah Harari", year: 2011, pages: 443, bg: "#f8f5ee", fg: "#1c1c1c" },
      { slug: "why-nations-fail", title: "Why Nations Fail", author: "Daron Acemoglu and James A. Robinson", year: 2012, pages: 529, bg: "#add2dc", fg: "#1c1c1c" },
    ],
  },
  {
    name: "Markets",
    books: [
      { slug: "the-misbehavior-of-markets", title: "The Misbehavior of Markets", author: "Benoit Mandelbrot and Richard L. Hudson", search: "Mandelbrot markets", year: 2004, pages: 328, bg: "#f7f101", fg: "#1c1c1c" },
      { slug: "a-man-for-all-markets", title: "A Man for All Markets", author: "Edward O. Thorp", year: 2017, pages: 416, bg: "#2a2828", fg: "#f4efe6" },
      { slug: "the-man-who-solved-the-market", title: "The Man Who Solved the Market", author: "Gregory Zuckerman", year: 2019, pages: 400, bg: "#252424", fg: "#f4efe6" },
      { slug: "irrational-exuberance", title: "Irrational Exuberance", author: "Robert J. Shiller", year: 2000, pages: 296, bg: "#6c6c6a", fg: "#f4efe6" },
      { slug: "the-psychology-of-money", title: "The Psychology of Money", author: "Morgan Housel", year: 2020, pages: 256, bg: "#fefefe", fg: "#1c1c1c" },
    ],
  },
  {
    name: "Uncertainty",
    books: [
      { slug: "fooled-by-randomness", title: "Fooled by Randomness", author: "Nassim Nicholas Taleb", year: 2001, pages: 316, bg: "#010001", fg: "#f4efe6" },
      { slug: "the-black-swan", title: "The Black Swan", author: "Nassim Nicholas Taleb", year: 2007, pages: 444, bg: "#fffeff", fg: "#1c1c1c" },
      { slug: "antifragile", title: "Antifragile", author: "Nassim Nicholas Taleb", year: 2012, pages: 544, bg: "#fefefe", fg: "#1c1c1c" },
    ],
  },
  {
    name: "Mind and body",
    books: [
      { slug: "thinking-fast-and-slow", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", year: 2011, pages: 512, bg: "#faf9f4", fg: "#1c1c1c" },
      { slug: "the-elephant-in-the-brain", title: "The Elephant in the Brain", author: "Kevin Simler and Robin Hanson", year: 2018, pages: 416, bg: "#fdfdfd", fg: "#1c1c1c" },
      { slug: "range", title: "Range", author: "David Epstein", year: 2019, pages: 352, bg: "#92eacc", fg: "#1c1c1c" },
      { slug: "why-we-sleep", title: "Why We Sleep", author: "Matthew Walker", year: 2017, pages: 368, bg: "#03254a", fg: "#f4efe6" },
    ],
  },
  {
    name: "Science fiction",
    books: [
      { slug: "do-androids-dream-of-electric-sheep", title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968, pages: 256, bg: "#e4e4e4", fg: "#1c1c1c", reading: true },
      { slug: "the-three-body-problem", title: "The Three-Body Problem", author: "Cixin Liu", year: 2008, pages: 400, bg: "#275698", fg: "#f4efe6" },
      { slug: "the-dark-forest", title: "The Dark Forest", author: "Cixin Liu", year: 2008, pages: 512, bg: "#1b181a", fg: "#f4efe6" },
      { slug: "deaths-end", title: "Death's End", author: "Cixin Liu", year: 2010, pages: 604, bg: "#050305", fg: "#f4efe6" },
      { slug: "dune", title: "Dune", author: "Frank Herbert", year: 1965, pages: 688, bg: "#e9a849", fg: "#1c1c1c" },
      { slug: "dune-messiah", title: "Dune Messiah", author: "Frank Herbert", year: 1969, pages: 336, bg: "#020203", fg: "#f4efe6" },
      { slug: "foundation", title: "Foundation", author: "Isaac Asimov", year: 1951, pages: 255, bg: "#b7b8d9", fg: "#1c1c1c" },
      { slug: "foundation-and-empire", title: "Foundation and Empire", author: "Isaac Asimov", year: 1952, pages: 282, bg: "#1a0114", fg: "#f4efe6" },
      { slug: "second-foundation", title: "Second Foundation", author: "Isaac Asimov", year: 1953, pages: 256, bg: "#040102", fg: "#f4efe6" },
      { slug: "foundations-edge", title: "Foundation's Edge", author: "Isaac Asimov", year: 1982, pages: 426, bg: "#060403", fg: "#f4efe6" },
      { slug: "snow-crash", title: "Snow Crash", author: "Neal Stephenson", year: 1992, pages: 480, bg: "#020305", fg: "#f4efe6" },
      { slug: "seveneves", title: "Seveneves", author: "Neal Stephenson", year: 2015, pages: 880, bg: "#383838", fg: "#f4efe6" },
      { slug: "reamde", title: "Reamde", author: "Neal Stephenson", year: 2011, pages: 1056, bg: "#f57421", fg: "#f4efe6" },
      { slug: "the-martian", title: "The Martian", author: "Andy Weir", year: 2011, pages: 384, bg: "#f78c36", fg: "#1c1c1c" },
      { slug: "project-hail-mary", title: "Project Hail Mary", author: "Andy Weir", year: 2021, pages: 496, bg: "#020206", fg: "#f4efe6" },
    ],
  },
  {
    name: "Classics",
    books: [
      { slug: "crime-and-punishment", title: "Crime and Punishment", author: "Fyodor Dostoevsky", year: 1866, pages: 545, bg: "#292736", fg: "#f4efe6" },
    ],
  },
  {
    name: "Want to read",
    upcoming: true,
    books: [
      { slug: "at-home-in-the-universe", title: "At Home in the Universe", author: "Stuart Kauffman", year: 1995, pages: 336, bg: "#0c0e0d", fg: "#f4efe6" },
    ],
  },
];
