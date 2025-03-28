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

  // Step 1: Create UI variant (for message bubbles)
  let uiVariant = color;
  let contrast = chroma.contrast(uiVariant, DARK_BG);
  
  // Only adjust if contrast is too low
  if (contrast < MIN_UI_CONTRAST) {
    // If color is too dark, gradually lighten
    while (contrast < MIN_UI_CONTRAST) {
      uiVariant = chroma.mix(uiVariant, 'white', 0.1);
      contrast = chroma.contrast(uiVariant, DARK_BG);
    }
  }

  // Step 2: Create text variant (for text and icons)
  let textVariant = color;
  contrast = chroma.contrast(textVariant, DARK_BG);
  
  // Adjust until we meet text contrast requirements
  while (contrast < MIN_TEXT_CONTRAST) {
    textVariant = chroma.mix(textVariant, 'white', 0.1);
    contrast = chroma.contrast(textVariant, DARK_BG);
  }

  // Step 3: Adjust lightness if needed for both variants
  const [_, __, uiL] = uiVariant.hsl();
  if (uiL > 0.8) {
    uiVariant = chroma.mix(uiVariant, DARK_BG, 0.6);
  }

  const [h2, s2, textL] = textVariant.hsl();
  if (textL > 0.9) {
    textVariant = chroma.mix(textVariant, DARK_BG, 0.3);
  }

  // Step 4: Adjust saturation for both variants
  const uiS = uiVariant.get('hsl.s');
  if (uiS > 0.7) {
    uiVariant = uiVariant.set('hsl.s', 0.7);
  } else if (uiS < 0.35 && s > 0.4) {
    uiVariant = uiVariant.set('hsl.s', 0.45);
  }

  const textS = textVariant.get('hsl.s');
  if (textS > 0.7) {
    textVariant = textVariant.set('hsl.s', 0.7);
  } else if (textS < 0.35 && s > 0.4) {
    textVariant = textVariant.set('hsl.s', 0.45);
  }

  // Step 5: Pick accessible text colors
  const textColorOnActionColor_light = 
    chroma.contrast(color, 'black') >= MIN_TEXT_CONTRAST ? '#000' : '#fff';
  
  const textColorOnActionColor_dark = 
    chroma.contrast(uiVariant, 'white') >= MIN_TEXT_CONTRAST ? '#fff' : '#000';

  // Return all color tokens
  return {
    // Light mode tokens
    'custom-base-500_light': color.hex(),
    'custom-base-900_light': chroma.mix(color, '#000', 0.6).hex(),
    'custom-base-100_light': chroma.mix(color, '#fff', 0.8).hex(),
    textColorOnActionColor_light,
    
    // Dark mode tokens
    'custom-base-500_dark': uiVariant.hex(),           // UI element variant (message bubbles)
    'action-color-text_dark': textVariant.hex(),       // Text variant (text and icons)
    'custom-base-900_dark': chroma.mix(textVariant, 'white', 0.1).hex(),
    'custom-base-100_dark': chroma.mix(textVariant, 'black', 0.95).hex(),
    textColorOnActionColor_dark,                       // Text color for use on action color background
  };
}