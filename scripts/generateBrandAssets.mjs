// Generates placeholder brand images in assets/brand/: a calendar glyph on a
// gradient for the icons, and an abstract skyline for the venue photo.
// Replace these with your own brand assets; this script only exists so the
// template looks finished before you do. No dependencies — shapes are drawn
// with signed distance functions and encoded as PNG by hand.
//
// Usage: node scripts/generateBrandAssets.mjs [--force] [--color "#0a7ea4"]

import { deflateSync } from "node:zlib";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "assets", "brand");
const force = process.argv.includes("--force");

const colorFlagIndex = process.argv.indexOf("--color");
const primary =
  colorFlagIndex === -1 ? "#087EA4" : process.argv[colorFlagIndex + 1];

// --- PNG encoding ----------------------------------------------------------

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

/** Encode an RGBA pixel buffer (width * height * 4) as a PNG. */
const encodePng = (width, height, pixels) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    pixels.copy(
      raw,
      y * (width * 4 + 1) + 1,
      y * width * 4,
      (y + 1) * width * 4,
    );
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

// --- Color helpers ---------------------------------------------------------

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

const shade = ([r, g, b], factor) =>
  factor >= 0
    ? [r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor]
    : [r * (1 + factor), g * (1 + factor), b * (1 + factor)];

const brand = hexToRgb(primary);

// --- Tiny SDF renderer -----------------------------------------------------

// A layer is { color: [r,g,b], alpha, sdf(x, y) } with x/y in 0..1 and the
// sdf returning a signed distance in the same units (negative = inside).

const roundRect = (cx, cy, hw, hh, r) => (x, y) => {
  const dx = Math.abs(x - cx) - hw + r;
  const dy = Math.abs(y - cy) - hh + r;
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - r;
};

const circle = (cx, cy, radius) => (x, y) =>
  Math.hypot(x - cx, y - cy) - radius;

/** Render layers over a background function, with SDF-based antialiasing. */
const render = (size, background, layers) => {
  const pixels = Buffer.alloc(size * size * 4);
  const aa = 1 / size;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5) / size;
      const y = (py + 0.5) / size;
      let [r, g, b, a] = background(x, y);
      for (const layer of layers) {
        const d = layer.sdf(x, y);
        const coverage =
          Math.min(Math.max(0.5 - d / aa, 0), 1) * (layer.alpha ?? 1);
        if (coverage > 0) {
          r = r + (layer.color[0] - r) * coverage;
          g = g + (layer.color[1] - g) * coverage;
          b = b + (layer.color[2] - b) * coverage;
          a = a + (1 - a) * coverage;
        }
      }
      const i = (py * size + px) * 4;
      pixels[i] = Math.round(r);
      pixels[i + 1] = Math.round(g);
      pixels[i + 2] = Math.round(b);
      pixels[i + 3] = Math.round(a * 255);
    }
  }
  return encodePng(size, size, pixels);
};

const gradient = (top, bottom) => (x, y) => {
  const t = y;
  return [
    top[0] + (bottom[0] - top[0]) * t,
    top[1] + (bottom[1] - top[1]) * t,
    top[2] + (bottom[2] - top[2]) * t,
    1,
  ];
};

const transparent = () => [0, 0, 0, 0];

// --- The calendar glyph ----------------------------------------------------

const white = [255, 255, 255];

/**
 * Calendar glyph layers within a centered box of the given scale.
 * `inkColor` fills the header and day dots (pass white for monochrome).
 */
const calendarGlyph = (scale, inkColor, { monochrome = false } = {}) => {
  const w = 0.3 * scale; // half width of the body
  const h = 0.26 * scale; // half height of the body
  const cy = 0.52;
  const top = cy - h;
  const layers = [
    // binding rings behind the body
    {
      color: white,
      sdf: roundRect(
        0.5 - w * 0.5,
        top - 0.015 * scale,
        0.024 * scale,
        0.05 * scale,
        0.024 * scale,
      ),
    },
    {
      color: white,
      sdf: roundRect(
        0.5 + w * 0.5,
        top - 0.015 * scale,
        0.024 * scale,
        0.05 * scale,
        0.024 * scale,
      ),
    },
    // body
    { color: white, sdf: roundRect(0.5, cy, w, h, 0.07 * scale) },
  ];
  if (monochrome) {
    return layers;
  }
  // header strip
  layers.push({
    color: inkColor,
    sdf: roundRect(
      0.5,
      top + 0.075 * scale,
      w - 0.035 * scale,
      0.045 * scale,
      0.03 * scale,
    ),
  });
  // 3x2 grid of day dots
  const dot = 0.031 * scale;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      layers.push({
        color: inkColor,
        alpha: row === 1 && col === 2 ? 0.35 : 1,
        sdf: roundRect(
          0.5 + (col - 1) * 0.145 * scale,
          cy + 0.02 * scale + row * 0.115 * scale,
          dot,
          dot,
          0.016 * scale,
        ),
      });
    }
  }
  return layers;
};

// --- The venue placeholder -------------------------------------------------

const venueLayers = () => {
  const dark = shade(brand, -0.55);
  const buildings = [
    [0.1, 0.52, 0.09],
    [0.28, 0.38, 0.1],
    [0.47, 0.58, 0.11],
    [0.66, 0.44, 0.09],
    [0.84, 0.62, 0.1],
  ].map(([cx, topY, hw]) => ({
    color: dark,
    alpha: 0.55,
    sdf: roundRect(cx, (topY + 1.2) / 2, hw, (1.2 - topY) / 2, 0.012),
  }));
  return [
    // a soft sun
    { color: shade(brand, 0.55), alpha: 0.5, sdf: circle(0.76, 0.2, 0.1) },
    ...buildings,
  ];
};

// --- Assets ----------------------------------------------------------------

const iconBackground = gradient(shade(brand, 0.18), shade(brand, -0.38));
const ink = shade(brand, -0.25);

const assets = [
  {
    name: "icon.png",
    size: 1024,
    background: iconBackground,
    layers: calendarGlyph(1, ink),
  },
  {
    // Android crops the adaptive icon to the middle ~66%, so the glyph is
    // smaller and the background color comes from the config.
    name: "adaptive-icon.png",
    size: 1024,
    background: transparent,
    layers: calendarGlyph(0.62, ink),
  },
  {
    name: "adaptive-icon-monochrome.png",
    size: 1024,
    background: transparent,
    layers: calendarGlyph(0.62, white, { monochrome: true }),
  },
  {
    name: "splash-icon.png",
    size: 512,
    background: transparent,
    layers: calendarGlyph(0.9, ink),
  },
  {
    name: "favicon.png",
    size: 48,
    background: iconBackground,
    layers: calendarGlyph(1.15, ink),
  },
  {
    name: "venue.png",
    size: 1200,
    background: gradient(shade(brand, 0.3), shade(brand, -0.3)),
    layers: venueLayers(),
  },
];

mkdirSync(brandDir, { recursive: true });

for (const { name, size, background, layers } of assets) {
  const path = join(brandDir, name);
  if (existsSync(path) && !force) {
    console.info(`• ${name} exists, skipping (use --force to overwrite)`);
    continue;
  }
  writeFileSync(path, render(size, background, layers));
  console.info(`✅ wrote ${name} (${size}x${size})`);
}
