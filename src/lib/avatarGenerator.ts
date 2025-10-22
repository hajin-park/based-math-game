/**
 * Generate a deterministic pixel art avatar SVG based on a user ID
 * Creates simple, minimal 8x8 pixel art patterns
 */

// Color palettes for avatars
const COLOR_PALETTES = [
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
  ['#6C5CE7', '#A29BFE', '#74B9FF', '#81ECEC', '#55EFC4'],
  ['#FD79A8', '#FDCB6E', '#E17055', '#00B894', '#00CEC9'],
  ['#FF7675', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E'],
  ['#E84393', '#0984E3', '#00B894', '#FDCB6E', '#6C5CE7'],
];

// Simple hash function to convert string to number
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Generate a pixel art avatar SVG
 * @param uid - User ID to generate avatar from
 * @param size - Size of the SVG in pixels (default: 128)
 * @returns SVG string as data URL
 */
export function generatePixelAvatar(uid: string, size: number = 128): string {
  const hash = hashCode(uid);
  const rng = new SeededRandom(hash);
  
  // Select color palette
  const paletteIndex = rng.nextInt(0, COLOR_PALETTES.length - 1);
  const palette = COLOR_PALETTES[paletteIndex];
  
  // Select background and foreground colors
  const bgColor = palette[rng.nextInt(0, palette.length - 1)];
  const fgColor = palette[rng.nextInt(0, palette.length - 1)];
  
  // Generate 8x8 grid (symmetric, so only need 4x8)
  const gridSize = 8;
  const halfWidth = Math.floor(gridSize / 2);
  const grid: boolean[][] = [];
  
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < halfWidth; x++) {
      // Random pixel with 50% probability
      grid[y][x] = rng.next() > 0.5;
    }
  }
  
  // Create SVG
  const pixelSize = size / gridSize;
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;
  
  // Draw pixels (mirrored for symmetry)
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < halfWidth; x++) {
      if (grid[y][x]) {
        // Left side
        svg += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${fgColor}"/>`;
        // Right side (mirrored)
        const mirrorX = gridSize - 1 - x;
        svg += `<rect x="${mirrorX * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${fgColor}"/>`;
      }
    }
  }
  
  svg += '</svg>';
  
  // Convert to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get user avatar URL - returns photoURL if available, otherwise generates pixel art
 * @param user - User object with optional photoURL
 * @param uid - User ID for generating pixel art
 * @returns Avatar URL (photoURL or generated pixel art)
 */
export function getUserAvatarUrl(user: { photoURL?: string | null } | null, uid: string): string | undefined {
  if (user?.photoURL) {
    return user.photoURL;
  }
  
  // Generate pixel art avatar based on UID
  return generatePixelAvatar(uid);
}

