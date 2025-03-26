import chroma from 'https://unpkg.com/chroma-js@3.0.0/index.js';

/**
 * Transforms a color to be suitable for dark mode while maintaining accessibility
 * @param {string} actionColor - The original color to transform
 * @returns {Object} Object containing transformed colors and text colors
 */
export function getDarkModeTokens(actionColor) {
  // Constants
  const DARK_BG = '#121212';
  const MIN_TEXT_CONTRAST = 4.5;  // WCAG AA standard
  const MIN_UI_CONTRAST = 2;      // Minimum contrast for UI elements
  const FALLBACK_COLOR = '#d1d1d1';
  
  // Convert input color to chroma object
  let color = chroma(actionColor);
  const [h, s, l] = color.hsl();

  // Step 1: Start with brand color (already done)
  
  // Step 2: Evaluate lightness and adjust accordingly
  let adjusted = color;
  
  if (l > 0.75) {
    // Light colors: Make much darker
    adjusted = chroma.mix(color, DARK_BG, 0.89);
  } else if (l < 0.3) {
    // Dark colors: Lighten for visibility
    adjusted = chroma.mix(color, 'white', 0.05);
  } else {
    // Medium-light colors: Slightly darker
    adjusted = chroma.mix(color, DARK_BG, 0.95);
  }

  // Step 3: Adjust contrast
  let contrast = chroma.contrast(adjusted, DARK_BG);
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  while (contrast < MIN_UI_CONTRAST && attempts < MAX_ATTEMPTS) {
    if (chroma(adjusted).get('hsl.l') < 0.5) {
      // If too dark, lighten slightly
      adjusted = chroma.mix(adjusted, 'white', 0.02);
    } else {
      // If too light, darken slightly
      adjusted = chroma.mix(adjusted, DARK_BG, 0.12);
    }
    contrast = chroma.contrast(adjusted, DARK_BG);
    attempts++;
  }

  // Fallback if contrast requirements can't be met
  if (contrast < MIN_UI_CONTRAST) {
    adjusted = chroma(FALLBACK_COLOR);
  }

  // Step 4: Adjust saturation if needed
  const finalSaturation = chroma(adjusted).get('hsl.s');
  
  if (finalSaturation > 0.8) {
    // Reduce high saturation to avoid visual strain
    adjusted = adjusted.set('hsl.s', 0.8);
  } else if (finalSaturation < 0.35) {
    // Increase low saturation to maintain color character
    // Only increase if the original color was moderately saturated
    if (s > 0.4) {
      adjusted = adjusted.set('hsl.s', 0.45);
    }
  }

  // Step 5: Pick accessible text colors
  const textColorOnActionColor_light = 
    chroma.contrast(color, 'black') >= MIN_TEXT_CONTRAST ? '#000' : '#fff';
  
  const textColorOnActionColor_dark = 
    chroma.contrast(adjusted, 'white') >= MIN_TEXT_CONTRAST ? '#fff' : '#000';

  // Return all color tokens
  return {
    // Light mode tokens
    'custom-base-500_light': color.hex(),
    'custom-base-900_light': chroma.mix(color, DARK_BG, 0.6).hex(),
    'custom-base-100_light': chroma.mix(color, '#fff', 0.8).hex(),
    textColorOnActionColor_light,
    
    // Dark mode tokens
    'custom-base-500_dark': adjusted.hex(),
    'custom-base-900_dark': chroma.mix(adjusted, 'white', 0.1).hex(),
    'custom-base-100_dark': chroma.mix(adjusted, DARK_BG, 0.9).hex(),
    textColorOnActionColor_dark,
  };
}