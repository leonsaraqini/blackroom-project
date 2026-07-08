import sharp from 'sharp';

const sourcePath = 'public/img/blackroom/shop/express-wordmark.png';
const wordmarkOut = 'public/img/blackroom/shop/express-wordmark-gradient.png';
const markOut = 'public/img/blackroom/shop/k-gradient.png';

const source = sharp(sourcePath).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// The source is RGBA but its white backdrop is opaque. Recover the original
// antialiased artwork coverage from its distance from white.
const alpha = Buffer.alloc(width * height);
for (let i = 0; i < width * height; i += 1) {
  const r = data[i * 4];
  const g = data[i * 4 + 1];
  const b = data[i * 4 + 2];
  const distance = Math.max(255 - r, 255 - g, 255 - b);
  alpha[i] = Math.min(255, Math.round((distance / 247) * 255));
}

const orange = [255, 152, 0];
const violet = [155, 92, 255];
const texture = Buffer.alloc(width * height * 3);
const centerX = width / 2;
const centerY = height / 2;
const maxDistance = Math.hypot(centerX, centerY);
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const distance = Math.hypot(x - centerX, y - centerY);
    // One continuous radial blend: orange at the center, violet at the edges.
    const mix = Math.min(1, distance / maxDistance);
    const index = (y * width + x) * 3;
    for (let channel = 0; channel < 3; channel += 1) {
      texture[index + channel] = Math.round(
        orange[channel] + (violet[channel] - orange[channel]) * mix,
      );
    }
  }
}

const renderWithMask = async (mask, output) => {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    if (mask[i] === 0) continue;
    rgba[i * 4] = texture[i * 3];
    rgba[i * 4 + 1] = texture[i * 3 + 1];
    rgba[i * 4 + 2] = texture[i * 3 + 2];
    rgba[i * 4 + 3] = mask[i];
  }
  await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(output);
};

await renderWithMask(alpha, wordmarkOut);

// Keep only the largest connected alpha component: the K. The detached text
// glyphs are smaller components and are discarded without altering the mark.
const seen = new Uint8Array(width * height);
let largest = [];
for (let start = 0; start < alpha.length; start += 1) {
  if (seen[start] || alpha[start] === 0) continue;
  const stack = [start];
  const component = [];
  seen[start] = 1;
  while (stack.length) {
    const index = stack.pop();
    component.push(index);
    const x = index % width;
    const y = Math.floor(index / width);
    const neighbors = [];
    if (x > 0) neighbors.push(index - 1);
    if (x + 1 < width) neighbors.push(index + 1);
    if (y > 0) neighbors.push(index - width);
    if (y + 1 < height) neighbors.push(index + width);
    for (const next of neighbors) {
      if (!seen[next] && alpha[next] > 0) {
        seen[next] = 1;
        stack.push(next);
      }
    }
  }
  if (component.length > largest.length) largest = component;
}

const kMask = Buffer.alloc(width * height);
for (const index of largest) kMask[index] = alpha[index];
await renderWithMask(kMask, markOut);

console.log(wordmarkOut);
console.log(markOut);
