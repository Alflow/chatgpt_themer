/* Genera los PNG de icons/ sin dependencias externas.
   Uso: node tools/make-icons.js */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SS = 4; // supersampling para antialias
const STOPS = [
  [0.00, [109, 94, 252]],   // violeta
  [0.35, [34, 211, 238]],   // cian
  [0.60, [244, 114, 182]],  // rosa
  [0.82, [251, 191, 36]],   // ámbar
  [1.00, [109, 94, 252]]    // vuelta al violeta (ciclo continuo)
];

function gradient(t) {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0] || i === STOPS.length - 1) {
      const [p0, c0] = STOPS[i - 1];
      const [p1, c1] = STOPS[i];
      const k = Math.min(1, Math.max(0, (t - p0) / (p1 - p0)));
      return c0.map((c, j) => Math.round(c + (c1[j] - c) * k));
    }
  }
  return STOPS[0][1];
}

function render(size) {
  const S = size * SS;
  const acc = new Float64Array(size * size * 4);
  const cx = S / 2, cy = S / 2;
  const rOuter = S * 0.47;
  const rHole = S * 0.17;
  // "hueco" de paleta desplazado, como el agujero del pulgar
  const hx = cx + S * 0.17, hy = cy + S * 0.15;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy > rOuter * rOuter) continue;
      const hdx = x + 0.5 - hx, hdy = y + 0.5 - hy;
      if (hdx * hdx + hdy * hdy < rHole * rHole) continue;

      const ang = (Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI);
      const [r, g, b] = gradient(ang);
      const d = Math.sqrt(dx * dx + dy * dy) / rOuter;
      const shade = 1 - 0.18 * d * d;

      const i = ((y / SS | 0) * size + (x / SS | 0)) * 4;
      acc[i] += r * shade; acc[i + 1] += g * shade; acc[i + 2] += b * shade; acc[i + 3] += 255;
    }
  }

  const px = Buffer.alloc(size * size * 4);
  const n = SS * SS;
  for (let i = 0; i < size * size; i++) {
    const a = acc[i * 4 + 3] / n;
    const cov = a / 255 || 1;
    px[i * 4] = Math.round(acc[i * 4] / n / cov);
    px[i * 4 + 1] = Math.round(acc[i * 4 + 1] / n / cov);
    px[i * 4 + 2] = Math.round(acc[i * 4 + 2] / n / cov);
    px[i * 4 + 3] = Math.round(a);
  }
  return px;
}

function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filtro None
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8 bits, RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });
[16, 32, 48, 128].forEach(size => {
  const file = path.join(dir, `icon${size}.png`);
  fs.writeFileSync(file, png(size, render(size)));
  console.log('✓', path.relative(process.cwd(), file));
});
