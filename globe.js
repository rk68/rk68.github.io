// ASCII globe. A grid of characters is shaded as a lit, rotating Earth. Each
// character sits on a spring, so the pointer can push it around like a particle.
(() => {
  const canvas = document.querySelector(".globe canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Land mask: equirectangular, 1 bit per degree, row 0 at the north pole,
  // column 0 at 180 degrees west. Rasterised from Natural Earth 110m land.
  const MAP_W = 360, MAP_H = 180;
  const MASK = Uint8Array.from(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg/wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/v8/AOD//z8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+///D/////5//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAH/j/+//////8PAAAAgB0AAHgAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAOD//wP8//////8BAACAfx4AAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAA4+I73//n///////8AAAAAfwAAAAAAAAAAAAAfAAAAAAAAAAAAAAAAAAAAAOAQACDwP4D///////8BAAAAPAQAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAADzAgPP5H8D//////38AAAAAAAAAAAAA4AEAAAD+DwAAAAAAAAAAAAAAAAAAAIC/g7PfBwAA/v////8AAAAAAAAAAADgBwAAwP//PwAA4B8AAAAAAAAAAAAAAAAMAAD8AgAA+P////8AAAAAAAAAAABwAAAA/P//AwAAAAAAAAAAAAAAAAAAAP8Ahvc5OwAA8P///38AAAAAAAAAAAAcAADg////34cHAAcAAAAAAAAAAAAAgN9/xzf8RwAA4P///z8AAAAAAAAAAAAPAB7g//////8fgB8AAAAAAT4AAAAAAO//B3f8/wsA4P///z8AAAAAAAAAAAAPAG////////8f2f8HAAAAAAD4HwAAAAD8H/D4/38A4P///xMAAAAAAPAHAAAAgN//////////////DwAAAAD+///h/4//H+/Bg/8BwP7//w8AAAAAwP8fAAAAj9///////////////88//v//////////////////////////////DwAA/P8cgEEAAAAAAAAAAAAAAAAA8P//////////////////////////////AwAA4AwAAGAAAAAAAAAAAAAAAAAAIP7/////////////////////////////AQBg4AAAABAAAAAAAAAAAAAAAAAAAf//////////////////////////////AByADwAAAAAAAAAAAAAAAAAAAAAAQID4///////////Pw/0DAP8HAMAfAACA//F//v////////////////////8/AAP4///////////BBPAHAP4HAAAAAADg//z///////////////////////9/AID///////////8AQ8ABAPwBAAAAAAD8P/7///////////////////////9fAMD//////////z8AwA8AAPgBAAAAAAD+H/7/////////////////////Of8BAID///z//////z8AwD8AAMABAAAAAAD+P/z///////////////////9/wH8AAAD8MwD//////x8AwH8MAAAAAAAAAAD+P2D///////////////////95cAAAAACAAwD8/////38AwP8eAAAAAAAAgAGcH/D//////////////////wEAOAAAAADADgDA/////38AgP8/AAAAAAAAwANAH/T//////////////////wAAfgAAAAAwAAAA//////8PgP8/AAAAAAAAwAFwD/7/////////////////PwAAfwAAAAAGAAAA//////8/wP//AAAAAAAAwAOwA/7/////////////////DwCAPwAAAIAAAAAA/v//////8///BwAAAAAAOAcgcP//////////////////HwAAHwAAAAAAAACA+P//////4///DwAAAAAAOA74/////////////////////wUADwAAAAAAAAAA8P//////4///DwAAAAAAGD///////////////////////wUAAwAAAAAAAAAA8P//////7///FwAAAAAAAB///////////////////////wUAAgAAAAAAAAAA0P//////////CAAAAAAAgOH//////////////////////w0AAAAAAAAAAAAAYP////////8xLAAAAAAAAPz//////////////////////wwAAAAAAAAAAAAAAP7//////38HfgAAAAAAgP///////////////////////wQAAAAAAAAAAAAAAP3///////8HUAAAAAAAAP7/////////////////////fwQAAAAAAAAAAAAAAP////////+XAAAAAAAAAPz///93/D/+////////////PwwAAAAAAAAAAAAAAP////////9/AAAAAAAAAPj//f9j/g/+////////////HwAAAAAAAAAAAAAAAP////////8MAAAAAAAAAPj/+P8B/Mf/////////////DwQAAAAAAAAAAAAAAP///////z8AAAAAAAAAcPzH8/8A8I//////////////Bx4AAAAAAAAAAAAAAP///////x8AAAAAAAAA+H+Aw/8AwA/+//////////9/AA8AAAAAAAAAAAAAAP///////x8AAAAAAAAA+D8Aj//w4R/8//////////8/AAAAAAAAAAAAAAAAAP///////wMAAAAAAAAA+B8wuE/+/z/+/////////98fAAMAAAAAAAAAAAAAAP///////wMAAAAAAAAA+A8wEMf//x/+/////////0cOAAMAAAAAAAAAAAAAAP7//////wEAAAAAAAAA+A8AAI7//x/8/////////wMOAAEAAAAAAAAAAAAAAP7//////wAAAAAAAAAA+AcABob//z/8/////////zccwAEAAAAAAAAAAAAAAPz//////wAAAAAAAAAAQOB/AAQ2/////////////x8c8AEAAAAAAAAAAAAAAPj//////wAAAAAAAAAAQPx/AAAA/////////////w8Y/gEAAAAAAAAAAAAAAPD/////fwAAAAAAAAAA4P8/AAAA/////////////w+EGwAAAAAAAAAAAAAAAMD/////HwAAAAAAAAAA8P9/AACA/////////////x/AAwAAAAAAAAAAAAAAAID/////DwAAAAAAAAAA+P//BwaA/////////////x/AAAAAAAAAAAAAAAAAAID9////BwAAAAAAAAAA/P//D3+E/////////////z9AAAAAAAAAAAAAAAAAAAD5////BwAAAAAAAAAA/P//f////////////////x8AAAAAAAAAAAAAAAAAAADy/x8GBgAAAAAAAAAA/P/////v/8///////////z8AAAAAAAAAAAAAAAAAAAD0/w8ABgAAAAAAAAAA/v////+//4///////////z8AAAAAAAAAAAAAAAAAAADu/wcADgAAAAAAAACA//////8f/x/+/////////x8AAAAAAAAAAAAAAAAAAACI/wcALAAAAAAAAADA//////8//z/g/////////w8AAAAAAAAAAAAAAAAAAACQ/wcACAAAAAAAAADg//////9//r+A/////////wcAAAAAAAAAAAAAAAAAAAAQ/wMAAAAAAAAAAADg//////9//n8cgP///////ycAAAAAAAAAAAAAAAAAAAAA/gMAAAAAAAAAAADw////////+P9/AP///////xEAAAAAAAAAAAAAAAAAAAAA/AMAHQAAAAAAAADw////////+P//APz/f///fxAAAAAAAAAAAAAAAAAAAAAA+AcAYAAAAAAAAAD4////////+f9/APz/B///BgAAAAAAAAAAAAAAAAAAAAAA/AccgAEAAAAAAADw////////8f9/AOD/B/5/AAAAAAAAAAAAAAAAAQAAAAAA+A8eADgAAAAAAADw////////4f8/AOD/Afw/BgAAAAAAAAAAAAAAAAAAAAAA8J8PAPwCAAAAAADw////////4/8fAOD/APw/AgAAAAAAAAAAAAAAAAAAAAAAgP8PAAAAAAAAAADw////////x/8HAOB/APx/ADAAAAAAAAAAAAAAAAAAAAAAAP4PAAAAAAAAAAD4////////h/8BAOA/APz/ADAAAAAAAAAAAAAAAAAAAAAAAID/AAAAAAAAAAD4////////j/8AAMAPAMD/ATAAAAAAAAAAAAAAAAAAAAAAAAD/AQAAAAAAAAD4////////nx8AAMAPAMD/ATAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAD4////////vwcAAIAPAMD/AcAAAAAAAAAAAAAAAAAAAAAAAADgAQAAAAAAAAD4////////fwAAAIAPAMD8AQABAAAAAAAAAAAAAAAAAAAAAADAAAgAAAAAAADw////////f2AAAAAPAID4AUACAAAAAAAAAAAAAAAAAAAAAADAAe9zAAAAAADg/////////34AAAAPAEBwAAgAAAAAAAAAAAAAAAAAAAAAAAAAE+9/AAAAAADA/////////38AAAAXAEAgAAQCAAAAAAAAAAAAAAAAAAAAAAAAz///AAAAAACA/////////z8AAAASAMAAAIACAAAAAAAAAAAAAAAAAAAAAAAAyP//AQAAAACA/////////z8AAAAwAIAAAEAHAAAAAAAAAAAAAAAAAAAAAAAAgP//AwAAAAAA/v///////x8AAAAwAAADAAMBAAAAAAAAAAAAAAAAAAAAAAAAwP//fwAAAAAA/A/+/////x8AAAAAAAAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAgP///wAAAAAAEAD8/////w8AAAAAADAGwAcAAAAAAAAAAAAAAAAAAAAAAAAAgP///wEAAAAAAADA/////wcAAAAAAGAG4AEAAAAAAAAAAAAAAAAAAAAAAAAA4P///wEAAAAAAADA/////wMAAAAAAMAM+AMAAAAAAAAAAAAAAAAAAAAAAAAA4P///wMAAAAAAADg/////wEAAAAAAIAL/gMQAAAAAAAAAAAAAAAAAAAAAAAA8P///wMAAAAAAADg////fwAAAAAAAIAH/vMQAAAAAAAAAAAAAAAAAAAAAAAA8P///wcAAAAAAADg////PwAAAAAAAAAP/gMAAQAAAAAAAAAAAAAAAAAAAAAA+P///38AAAAAAADg////PwAAAAAAAAAO/DmAAwAAAAAAAAAAAAAAAAAAAAAA+P///38BAAAAAADA////HwAAAAAAAAA+/DkA8gAAAAAAAAAAAAAAAAAAAAAA8P////8fAAAAAACA////DwAAAAAAAAA8wChE/gcAAAAAAAAAAAAAAAAAAAAA+P////8/AAAAAACA////BwAAAAAAAAA4AEAA8B8AAAAAAAAAAAAAAAAAAAAA+P//////AQAAAAAA////BwAAAAAAAAAwAEAAxD8NAAAAAAAAAAAAAAAAAAAA+P//////AQAAAAAA////BwAAAAAAAADAAQAAxP+AAAAAAAAAAAAAAAAAAAAA8P//////AQAAAAAA/v//BwAAAAAAAACAHwAAwH8ABAAAAAAAAAAAAAAAAAAA4P//////AQAAAAAA/v//BwAAAAAAAAAAQFYEAMcAAAAAAAAAAAAAAAAAAAAA4P//////AAAAAAAA/v//DwAAAAAAAAAAAAgBAIABMAAAAAAAAAAAAAAAAAAAwP//////AAAAAAAA/v//DwAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAgP////9/AAAAAAAA/P//DwAAAAAAAAAAAAAAAQQAAAAAAAAAAAAAAAAAAAAAgP////8/AAAAAAAA/v//HyAAAAAAAAAAAACAHwQAAAAAAAAAAAAAAAAAAAAAAP////8fAAAAAAAA/v//HyAAAAAAAAAAAADADwwAAAAAAAAAAAAAAAAAAAAAAP////8fAAAAAAAA////HzAAAAAAAAAAAADsDxwAAAAAAAAAAAAAAAAAAAAAAP7///8fAAAAAAAA////DzgAAAAAAAAAAAD/DxwAAAAA//////////////////////////////////////////////////////////9/AAAAAAAAAAAAAAAAAOD///8fAAAAAAAA////Ax8AAAAAAAAAAMD//z4AAABAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA////AB8AAAAAAAAAAMD//z8AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8AAAAAAAAAAOD//38AAAAAAAAAAAAAAAAAAAAAAMD///8PAAAAAAAA/v9/AB8AAAAAAAAAAPz///8BAAEAAAAAAAAAAAAAAAAAAMD///8HAAAAAAAA/P9/gA8AAAAAAAAAgP////8BAAIAAAAAAAAAAAAAAAAAAMD///8DAAAAAAAA/P//gA8AAAAAAAAAwP////8DAAAAAAAAAAAAAAAAAAAAAMD//38AAAAAAAAA/P9/AA8AAAAAAAAAwP////8HAAAAAAAAAAAAAAAAAAAAAOD//x8AAAAAAAAA+P9/AAcAAAAAAAAA4P////8PAAAAAAAAAAAAAAAAAAAAAOD//w8AAAAAAAAA+P8fAAIAAAAAAAAAwP////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAAAAAAAAAAA4P////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA+P8fAAAAAAAAAAAAwP////8fAAAAAAAAAAAAAAAAAAAAAOD//wcAAAAAAAAA8P8PAAAAAAAAAAAAgP////8/AAAAAAAAAAAAAAAAAAAAAOD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAPD//wMAAAAAAAAA4P8HAAAAAAAAAAAAgP////8fAAAAAAAAAAAAAAAAAAAAAPD//wEAAAAAAAAAwP8DAAAAAAAAAAAAAP////8fAAAAAAAAAAAAAAAAAAAAAOD//wAAAAAAAAAAwP8BAAAAAAAAAAAAAP8D/P8PAAAAAAAAAAAAAAAAAAAAAPD/fwAAAAAAAAAAwH8AAAAAAAAAAAAAgP8A2P8HAAAAAAAAAAAAAAAAAAAAAPD/OwAAAAAAAAAAgAEAAAAAAAAAAAAAAAcA6P8HAAAAAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP8DAAACAAAAAAAAAAAAAAAAAPj/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAEAAAAAAAAAAAAAAAAAPz/BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8DAAAIAAAAAAAAAAAAAAAAAPj/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgAAAA4AAAAAAAAAAAAAAAAAPg/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAPw/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAALAAAAAAAAAAAAAAAAAPwfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAIADAAAAAAAAAAAAAAAAAPgHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAMABAAAAAAAAAAAAAAAAAPwHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAAP4BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAP4DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH6AAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAIAfAAAAAAAeeADADwAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAPD/AADA/////////z8AAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAgP///wH4//////////8DAAAAAAAAAAAAAAAAAAAAADAfAAAAAAAAAAAAAADw8////wP+////////////AwAAAAAAAAAAAAAAAAAAAHA/AAAAAAAAAAA8//P//////+D/////////////HwAAAAAAAAAAAAAAAAAAAP5+AAAAAAAA5v////////////D//////////////38AAAAAAAAAAAAAAAAAAAB+AAAAAACA/////////////////////////////38AAAAAAAAAYAYA4ON/OPh/AAAAAADw/////////////////////////////x8AAAAAAADwv/MXgP////8fAAAAAADw/////////////////////////////wMAAAAAAPz///////////8HAAAAAAD+/////////////////////////////wAAAAAAAPz//////////z8AAAAAAP///////////////////////////////wAAAADA/////////////wEAAAAA8P///////////////////////////////wAAAACH////////////PwAAAPgA/////////////////////////////////wcAAAAcgP//////////fwAAAP4BwP//////////////////////////////HwAAAAAAAP7//////////wf8wD8AwP//////////////////////////////DwAAAAAA/v////////////8HAAD4////////////////////////////////HwAAAAAA+P//////////////4f///////////////////////////////////wAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////"), (c) => c.charCodeAt(0));
  // Large cities as latitude, longitude pairs. They light up on the night side.
  const CITIES = [
    51.5, -0.1, 48.9, 2.3, 40.4, -3.7, 41.9, 12.5, 52.5, 13.4, 55.8, 37.6, 41, 29, 30, 31.2, 6.5, 3.4,
    -4.3, 15.3, -26.2, 28, -1.3, 36.8, 33.6, -7.6, 25.2, 55.3, 35.7, 51.4, 24.7, 46.7, 24.9, 67,
    28.6, 77.2, 19.1, 72.9, 13, 77.6, 22.6, 88.4, 23.8, 90.4, 13.8, 100.5, 1.3, 103.8, -6.2, 106.8,
    14.6, 121, 22.3, 114.2, 31.2, 121.5, 39.9, 116.4, 37.6, 127, 35.7, 139.7, 34.7, 135.5,
    -33.9, 151.2, -37.8, 145, -32, 115.9, -36.8, 174.8, 21.3, -157.9, 61.2, -149.9, 49.3, -123.1,
    47.6, -122.3, 37.8, -122.4, 34.1, -118.2, 39.7, -105, 19.4, -99.1, 29.8, -95.4, 41.9, -87.6,
    43.7, -79.4, 40.7, -74, 38.9, -77, 25.8, -80.2, 23.1, -82.4, 4.7, -74.1, -12, -77, -33.5, -70.7,
    -34.6, -58.4, -23.6, -46.6, -22.9, -43.2, -15.8, -47.9, 10.5, -66.9, 14.7, -17.5, 5.6, -0.2,
    9, 38.7, 38.7, -9.1, 59.3, 18.1, 50.5, 30.5, 41.3, 69.3, 55, 82.9, 30.7, 104.1, 23.1, 113.3,
    25, 121.6, 10.8, 106.7, 3.1, 101.7, -33.9, 18.4, -8.8, 13.2, 15.6, 32.5, 33.3, 44.4, 31.5, 74.3,
    13.1, 80.3, 17.4, 78.5, 30.6, 114.3, 32.8, -96.8, 33.7, -84.4, 45.5, -73.6, -0.2, -78.5,
    53.3, -6.3, 48.2, 16.4, 52.2, 21, 38, 23.7, 59.9, 30.3, 36.8, 3.1, 32.1, 34.8, -27.5, 153,
  ];

  const RAMP = ".:-=+*#%@"; // sparse to dense
  const FONT = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';
  const TAU = Math.PI * 2, DEG = 360 / TAU;

  const RADIUS = 0.37; // sphere radius as a share of the canvas width
  const HALO = 1.12; // outer edge of the atmosphere, in sphere radii
  const EDGE = 0.5 / RADIUS; // canvas edge, in sphere radii
  const BASE_SPIN = TAU / 60; // radians per second
  const GRID = 30; // degrees between graticule lines
  const DUSK = 0.2; // light level below which cities show
  const DRIFT = 1.6; // cloud speed over the surface, degrees per second
  const REACH = 90; // pointer influence radius, px
  const PUSH = 1700; // pointer repulsion, px/s^2
  const SPRING = 60, DAMPING = 9; // slightly underdamped, so characters wobble home
  const LABEL_LEN = 11; // width of the coordinate readout, in cells

  // The view tilts the axis: roll it clockwise, then tip the north pole forward.
  const ROLL = 0.22, PITCH = 0.38;
  const [CR, SR, CP, SP] = [Math.cos(ROLL), Math.sin(ROLL), Math.cos(PITCH), Math.sin(PITCH)];
  // A point on the unit sphere in view space (x right, y up, z to the viewer)
  // to [latitude, longitude] in degrees. Latitude does not change as the globe
  // spins. Subtract the spin angle from the longitude to get the true value.
  const toEarth = (x, y, z) => {
    const x1 = x * CR + y * SR, y1 = y * CR - x * SR;
    return [Math.asin(y1 * CP + z * SP) * DEG, Math.atan2(x1, z * CP - y1 * SP) * DEG];
  };
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, v) => {
    const t = clamp01((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  // Colour ramps, each running from its base colour to the accent.
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const STEPS = 8;
  const ACCENT = [92, 200, 255];
  const ramp = (base) => Array.from({ length: STEPS }, (_, i) => mix(base, ACCENT, i / (STEPS - 1)));
  const LAND = ramp([236, 242, 246]), SEA = ramp([84, 128, 160]);
  const ACCENT_CSS = LAND[STEPS - 1], CITY_CSS = "rgb(255,214,160)";

  // Surface map, one value per degree. Above 0 is land, and the value is how
  // dense its character is: noise for terrain, plus a boost at the coast so the
  // outlines read. At or below 0 is sea, and the size is how close a coast is.
  // The cloud map holds cover from 0 to 1, in bands that run east to west.
  const surface = new Float32Array(MAP_W * MAP_H);
  const cloud = new Float32Array(MAP_W * MAP_H);
  const city = new Uint8Array(MAP_W * MAP_H);
  {
    const land = (c, r) => (MASK[(r * MAP_W + c) >> 3] >> ((r * MAP_W + c) & 7)) & 1;
    const hash = (x, y, z) => {
      let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x9e3779b1);
      h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
      return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
    };
    const lerp = (a, b, t) => a + (b - a) * t;
    const noise = (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const u = smooth(0, 1, x - xi), v = smooth(0, 1, y - yi), w = smooth(0, 1, z - zi);
      const face = (k) => lerp(
        lerp(hash(xi, yi, k), hash(xi + 1, yi, k), u),
        lerp(hash(xi, yi + 1, k), hash(xi + 1, yi + 1, k), u), v);
      return lerp(face(zi), face(zi + 1), w);
    };
    for (let r = 0; r < MAP_H; r++) {
      const lat = (90 - r - 0.5) / DEG, cl = Math.cos(lat), sl = Math.sin(lat);
      // Widen the window towards the poles, where a degree of longitude is short.
      const reach = Math.min(24, Math.round(2.2 / Math.max(cl, 0.05)));
      for (let c = 0; c < MAP_W; c++) {
        let sum = 0, n = 0;
        for (let rr = Math.max(0, r - 2); rr <= Math.min(MAP_H - 1, r + 2); rr++) {
          for (let dc = -reach; dc <= reach; dc++, n++) sum += land((c + dc + MAP_W) % MAP_W, rr);
        }
        const near = sum / n; // share of land nearby
        const lon = (c + 0.5 - 180) / DEG;
        const [x, y, z] = [cl * Math.sin(lon), sl, cl * Math.cos(lon)];
        // Noise is stretched along latitude and bent by a second noise field,
        // which gives streaks and swirls in place of round blobs.
        const bend = noise(x * 2.2 + 9, y * 2.2, z * 2.2) * 1.6;
        const cover = 0.6 * noise(x * 3 + bend, y * 6.5 + 40, z * 3 + bend)
          + 0.4 * noise(x * 7 + bend, y * 14 + 80, z * 7 - bend);
        cloud[r * MAP_W + c] = smooth(0.52, 0.76, cover);
        if (!land(c, r)) {
          surface[r * MAP_W + c] = -near;
          continue;
        }
        const terrain = 0.5 * noise(x * 5, y * 5, z * 5) + 0.32 * noise(x * 11, y * 11, z * 11)
          + 0.18 * noise(x * 23, y * 23, z * 23);
        // Small islands get no coast boost, or they show as stray dense specks.
        const coast = (1 - smooth(0.5, 0.95, near)) * smooth(0.06, 0.3, near);
        surface[r * MAP_W + c] = 0.1 + 0.7 * smooth(0.22, 0.78, terrain) + 0.42 * coast;
      }
    }
    // Each city covers a 3 by 3 degree patch, so a grid cell always samples it.
    for (let k = 0; k < CITIES.length; k += 2) {
      const r0 = Math.floor(90 - CITIES[k]), c0 = Math.floor(CITIES[k + 1] + 180);
      for (let r = r0 - 1; r <= r0 + 1; r++) {
        for (let c = c0 - 1; c <= c0 + 1; c++) city[r * MAP_W + ((c + MAP_W) % MAP_W)] = 1;
      }
    }
  }

  let size = 0, cols = 0, rows = 0, cw = 0, ch = 0, count = 0, labelAt = 0;
  // Per cell. kind: 0 space, 1 sphere, 2 atmosphere.
  let kind, mapRow, onParallel, lon0, lonSpan, light, rim, glint, veil, seed, tex, hx, hy, ox, oy, vx, vy, heat;

  let spin = 0.17, spinVel = BASE_SPIN;
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, on: false };
  const waves = []; // click shockwaves: {x, y, born}
  let label = "", labelAlpha = 0;

  // Coordinates under a canvas point, as fixed-width text. Empty off the sphere.
  function coords(px, py) {
    const R = size * RADIUS;
    const x = (px - size / 2) / R, y = (size / 2 - py) / R;
    const d2 = x * x + y * y;
    if (d2 >= 1) return "";
    const [lat, lon] = toEarth(x, y, Math.sqrt(1 - d2));
    const la = Math.round(lat);
    let lo = Math.round((lon - spin * DEG) % 360);
    if (lo > 180) lo -= 360;
    if (lo < -180) lo += 360;
    return `${String(Math.abs(la)).padStart(2)} ${la < 0 ? "S" : "N"}  ${String(Math.abs(lo)).padStart(3)} ${lo < 0 ? "W" : "E"}`;
  }

  function build(scatter) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cw = Math.min(5.2, Math.max(4.2, size / 124));
    ch = cw * 1.62;
    cols = Math.floor(size / cw);
    rows = Math.floor(size / ch);
    count = cols * rows;
    ctx.font = `${(ch * 0.96).toFixed(2)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    kind = new Uint8Array(count);
    onParallel = new Uint8Array(count);
    mapRow = new Uint16Array(count);
    [lon0, lonSpan, light, rim, glint, veil, seed, tex, hx, hy, ox, oy, vx, vy, heat] =
      Array.from({ length: 15 }, () => new Float32Array(count));

    const R = size * RADIUS;
    const padX = (size - cols * cw) / 2, padY = (size - rows * ch) / 2;
    // Light from the upper right, a little towards the viewer. The sun glints
    // off the sea where the surface faces halfway between the light and the eye.
    const L = [0.8, 0.46, 0.38], H = [0.48, 0.28, 0.83];
    // The readout sits on one grid row under the sphere, centred.
    const labelRow = Math.min(rows - 1, Math.round((size / 2 + R * 1.2 - padY) / ch));
    labelAt = labelRow * cols + ((cols - LABEL_LEN) >> 1);
    // Change in [lat, lon] from a point to a neighbour half a cell away. Steps
    // inward when the neighbour would fall off the disc.
    const stepTo = (x, y, dx, dy, from) => {
      if ((x + dx) ** 2 + (y + dy) ** 2 >= 1) [dx, dy] = [-dx, -dy];
      const d2 = (x + dx) ** 2 + (y + dy) ** 2;
      if (d2 >= 1) return [9, 9];
      const to = toEarth(x + dx, y + dy, Math.sqrt(1 - d2));
      const dLon = Math.abs(to[1] - from[1]);
      return [Math.abs(to[0] - from[0]), Math.min(dLon, 360 - dLon)];
    };

    for (let r = 0, i = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        hx[i] = padX + (c + 0.5) * cw;
        hy[i] = padY + (r + 0.5) * ch;
        // Readout cells stay clear of stars: 0.3 is outside every star range.
        seed[i] = i >= labelAt && i < labelAt + LABEL_LEN ? 0.3 : Math.random();
        tex[i] = Math.random();
        const x = (hx[i] - size / 2) / R, y = (size / 2 - hy[i]) / R;
        const d = Math.hypot(x, y);
        // Everything off the sphere fades out before the canvas edge.
        veil[i] = 1 - smooth(HALO, EDGE - 0.02, d);
        if (d < 1) {
          const z = Math.sqrt(1 - d * d);
          kind[i] = 1;
          light[i] = clamp01((x * L[0] + y * L[1] + z * L[2] + 0.12) / 0.95) ** 1.15;
          rim[i] = (1 - z) ** 2.2;
          glint[i] = clamp01(x * H[0] + y * H[1] + z * H[2]) ** 48;
          const at = toEarth(x, y, z);
          mapRow[i] = Math.min(MAP_H - 1, Math.floor(90 - at[0]));
          lon0[i] = at[1] + 180;
          // A graticule line crosses this cell if it lies within the cell's
          // extent in degrees. Capped so lines stay thin near the limb.
          const across = stepTo(x, y, (0.5 * cw) / R, 0, at), down = stepTo(x, y, 0, (0.5 * ch) / R, at);
          const latSpan = Math.min(2.5, Math.max(across[0], down[0]));
          lonSpan[i] = Math.abs(at[0]) > 78 ? 0 : Math.min(2.5, Math.max(across[1], down[1]));
          const off = ((at[0] % GRID) + GRID) % GRID;
          onParallel[i] = Math.min(off, GRID - off) < latSpan && Math.abs(at[0]) < 85 ? 1 : 0;
        } else if (d < HALO) {
          kind[i] = 2;
          const limb = ((x * L[0] + y * L[1]) / d + 0.15) / 0.95;
          light[i] = clamp01(limb) * (1 - (d - 1) / (HALO - 1));
        }
        if (scatter && kind[i]) {
          ox[i] = (Math.random() - 0.5) * size * 0.4;
          oy[i] = (Math.random() - 0.5) * size * 0.4;
        }
      }
    }
  }

  function step(dt, now) {
    spinVel += (BASE_SPIN - spinVel) * (1 - Math.exp(-dt * 0.9));
    spin += spinVel * dt;
    pointer.vx *= Math.exp(-dt * 8);
    pointer.vy *= Math.exp(-dt * 8);
    while (waves.length && now - waves[0].born > 1.1) waves.shift();
    const text = pointer.on ? coords(pointer.x, pointer.y) : "";
    if (text) label = text;
    labelAlpha += ((text ? 1 : 0) - labelAlpha) * (1 - Math.exp(-dt * 6));

    // Shimmer: a few cells pick a new texture value each frame.
    for (let n = Math.ceil(count * 0.003); n > 0; n--) tex[(Math.random() * count) | 0] = Math.random();

    const cool = Math.exp(-dt * 3.2);
    for (let i = 0; i < count; i++) {
      let ax = -SPRING * ox[i] - DAMPING * vx[i];
      let ay = -SPRING * oy[i] - DAMPING * vy[i];
      const x = hx[i] + ox[i], y = hy[i] + oy[i];
      let h = heat[i] * cool;

      if (pointer.on) {
        const dx = x - pointer.x, dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REACH * REACH) {
          const d = Math.sqrt(d2) || 1;
          const f = 1 - d / REACH;
          ax += (dx / d) * f * f * PUSH + pointer.vx * f * 6;
          ay += (dy / d) * f * f * PUSH + pointer.vy * f * 6;
          if (f > h) h = f;
        }
      }
      for (let n = 0; n < waves.length; n++) {
        const w = waves[n], age = now - w.born;
        const dx = x - w.x, dy = y - w.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = 1 - Math.abs(d - age * 520) / 46;
        if (f > 0) {
          const fade = 1 - age / 1.1;
          ax += (dx / d) * f * fade * 2600;
          ay += (dy / d) * f * fade * 2600;
          if (f * fade > h) h = f * fade;
        }
      }
      vx[i] += ax * dt;
      vy[i] += ay * dt;
      ox[i] += vx[i] * dt;
      oy[i] += vy[i] * dt;
      heat[i] = h;
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, size, size);
    const shift = spin * DEG, drift = (now * DRIFT) % 360;
    let style = "";
    const put = (glyph, i, color, alpha) => {
      if (color !== style) ctx.fillStyle = style = color;
      ctx.globalAlpha = alpha > 1 ? 1 : alpha;
      ctx.fillText(glyph, hx[i] + ox[i], hy[i] + oy[i]);
    };
    const glyphFor = (v) => RAMP[v <= 0 ? 0 : v >= 1 ? 8 : (v * 9) | 0];

    for (let i = 0; i < count; i++) {
      const h = heat[i], k = kind[i];
      if (k === 1) {
        // The pointer works as a torch, so the night side shows up under it.
        const lit = Math.max(light[i], h * 0.85);
        let lon = (lon0[i] - shift) % 360;
        if (lon < 0) lon += 360;
        const at = mapRow[i] * MAP_W + (lon | 0);
        const s = surface[at];
        if (city[at] && lit < DUSK) {
          put(tex[i] > 0.5 ? "*" : "+", i, CITY_CSS, (1 - lit / DUSK) * (0.5 + 0.5 * tex[i]));
          continue;
        }
        const edge = rim[i] * light[i];
        const tint = Math.min(STEPS - 1, (Math.max(edge * 1.6, h * 0.9) * STEPS) | 0);
        if (s > 0) {
          put(glyphFor(s * 0.75 + lit * 0.25 + (tex[i] - 0.5) * 0.22), i, LAND[tint], 0.1 + 0.9 * lit);
          continue;
        }
        // Cloud shows over the sea only, so the coasts stay sharp.
        const cover = cloud[mapRow[i] * MAP_W + ((lon + drift) % 360 | 0)] * smooth(0.04, 0.3, lit);
        if (cover > 0.1) {
          put(glyphFor(cover * 0.36 + (tex[i] - 0.5) * 0.14), i, LAND[tint], cover * (0.15 + 0.5 * lit));
          continue;
        }
        // Clear sea: mostly empty. Dots near a coast, along the graticule, under
        // the sun's glint and at the lit limb.
        const off = lon % GRID;
        const line = onParallel[i] || Math.min(off, GRID - off) < lonSpan[i];
        const shine = glint[i] * (0.6 + 0.4 * tex[i]);
        const v = (line ? 0.15 : 0) - s * 0.42 + shine * 0.5 + edge * 0.55;
        if (v > 0.07 || tex[i] > 0.62) {
          const a = (line ? 0.3 : 0.16) + 0.5 * lit + shine * 0.4;
          put(glyphFor(v + (tex[i] - 0.5) * 0.05), i, SEA[Math.max(tint, (shine * 5) | 0)], a);
        }
      } else if (k === 2 && tex[i] < light[i] * 0.55) {
        put(".", i, ACCENT_CSS, 0.25 + 0.5 * light[i]);
      } else if (seed[i] < 0.012) {
        put(seed[i] < 0.003 ? "+" : ".", i, LAND[0], (0.14 + 0.2 * tex[i] + h * 0.6) * veil[i]);
      } else if (h > 0.06 && seed[i] > 0.5) {
        put(seed[i] > 0.96 ? "+" : ".", i, ACCENT_CSS, h * 0.5 * veil[i]);
      }
    }
    if (labelAlpha > 0.02) {
      for (let j = 0; j < LABEL_LEN; j++) {
        if (label[j] !== " ") put(label[j], labelAt + j, SEA[2], labelAlpha * 0.9);
      }
    }
    ctx.globalAlpha = 1;
  }

  build(!still);
  new ResizeObserver(() => {
    if (canvas.clientWidth === size) return;
    build(false);
    draw(performance.now() / 1000);
  }).observe(canvas);

  if (still) {
    draw(0);
    return;
  }

  let last = 0, frame = 0, visible = true;
  function tick(t) {
    const now = t / 1000;
    step(Math.min(now - last, 1 / 30), now);
    last = now;
    draw(now);
    frame = visible ? requestAnimationFrame(tick) : 0;
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) {
      last = performance.now() / 1000;
      frame = requestAnimationFrame(tick);
    }
  }).observe(canvas);

  // The canvas ignores pointer events so the text under it stays selectable.
  // The listeners sit on the window and convert to canvas coordinates.
  const local = (e) => {
    const box = canvas.getBoundingClientRect();
    return [e.clientX - box.left, e.clientY - box.top];
  };
  const inside = (x, y, margin) => x > -margin && y > -margin && x < size + margin && y < size + margin;

  addEventListener("pointermove", (e) => {
    const [x, y] = local(e);
    if (pointer.on) {
      pointer.vx = (x - pointer.x) * 60;
      pointer.vy = (y - pointer.y) * 60;
      // A sideways sweep across the sphere spins it.
      if (Math.hypot(x - size / 2, y - size / 2) < size * RADIUS) {
        spinVel = Math.max(-2.5, Math.min(2.5, spinVel + ((x - pointer.x) / (size * RADIUS)) * 0.9));
      }
    }
    pointer.x = x;
    pointer.y = y;
    pointer.on = inside(x, y, REACH);
  }, { passive: true });

  addEventListener("pointerdown", (e) => {
    const [x, y] = local(e);
    if (inside(x, y, 0)) waves.push({ x, y, born: performance.now() / 1000 });
  }, { passive: true });

  const release = (e) => {
    if (e.type !== "pointerup" || e.pointerType !== "mouse") pointer.on = false;
  };
  for (const type of ["pointerup", "pointercancel", "blur"]) addEventListener(type, release);
  document.documentElement.addEventListener("pointerleave", release);
})();
