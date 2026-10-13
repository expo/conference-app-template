// Generates solid-color placeholder images in assets/brand/.
// Replace these with your own brand assets; this script only exists so the
// template builds before you do.
//
// Usage: node scripts/generateBrandAssets.mjs [--force]

import { deflateSync } from "node:zlib";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "assets", "brand");
const force = process.argv.includes("--force");

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

const solidPng = (width, height, [r, g, b, a]) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const row = Buffer.concat([
    Buffer.from([0]), // filter: none
    Buffer.alloc(width * 4).fill(Buffer.from([r, g, b, a])),
  ]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

const hexToRgba = (hex, alpha = 255) => {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    alpha,
  ];
};

const primary = "#087EA4";
const assets = [
  { name: "icon.png", size: [1024, 1024], color: hexToRgba(primary) },
  { name: "adaptive-icon.png", size: [1024, 1024], color: hexToRgba(primary) },
  {
    name: "adaptive-icon-monochrome.png",
    size: [1024, 1024],
    color: [255, 255, 255, 255],
  },
  { name: "splash-icon.png", size: [512, 512], color: hexToRgba(primary) },
  { name: "favicon.png", size: [48, 48], color: hexToRgba(primary) },
  { name: "venue.png", size: [1200, 1200], color: hexToRgba("#606060") },
];

mkdirSync(brandDir, { recursive: true });

for (const { name, size, color } of assets) {
  const path = join(brandDir, name);
  if (existsSync(path) && !force) {
    console.info(`• ${name} exists, skipping (use --force to overwrite)`);
    continue;
  }
  writeFileSync(path, solidPng(size[0], size[1], color));
  console.info(`✅ wrote ${name} (${size[0]}x${size[1]})`);
}
