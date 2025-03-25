import chroma from 'https://unpkg.com/chroma-js@3.0.0/index.js';

/**
 * Transforms a color to be suitable for dark mode while maintaining accessibility
 * @param {string} actionColor - The original color to transform
 * @returns {Object} Object containing transformed colors and text colors
 */
export function getDarkModeTokens(actionColor) {
  // Accessibility thresholds for contrast ratios
  const MIN_TEXT_CONTRAST = 4.5;  // WCAG AA standard for normal text
  const MIN_BG_CONTRAST = 3;      // Minimum contrast for background colors
  const DARK_BG = '#121212';      // Dark mode background color
  const FALLBACK_COLOR = '#d1d1d1'; // Fallback color when contrast requirements can't be met

  // Convert input color to chroma object for manipulation
  let color = chroma(actionColor);
  const [h, s, l] = color.hsl();  // Get HSL values for color analysis
  let textColorOnActionColor_light;  // Declare variable at the top

  // Check if color is too light and has poor contrast in light mode
  const isTooLight = l > 0.85;  // Very light colors
  const hasPoorContrast = chroma.contrast(color, 'black') < MIN_TEXT_CONTRAST && 
                         chroma.contrast(color, 'white') < MIN_TEXT_CONTRAST;

  // If color is too light and has poor contrast, use a darker fallback
  if (isTooLight && hasPoorContrast) {
    color = chroma('#808080');  // Medium gray as fallback for light mode
    textColorOnActionColor_light = '#fff';
  } else {
    // Determine text color for light mode based on contrast
    textColorOnActionColor_light =
      chroma.contrast(color, 'black') >= MIN_TEXT_CONTRAST
        ? '#000'
        : chroma.contrast(color, 'white') >= MIN_TEXT_CONTRAST
        ? '#fff'
        : null;

    // If no text color meets contrast requirements, use fallback color
    if (!textColorOnActionColor_light) {
      color = chroma(FALLBACK_COLOR);
      textColorOnActionColor_light = '#000';
    }
  }

  // Adjust color based on its HSL properties
  let adjusted = color;
  
  // Handle light colors in dark mode
  if (l > 0.6) {
    // Darken light colors to make them less shiny in dark mode
    adjusted = chroma.mix(color, 'black', 0.4);
  }

  // Handle medium-light unsaturated colors
  else if (l >= 0.4 && l <= 0.75 && s <= 0.5) {
    // Mix with dark background for medium-light, unsaturated colors
    adjusted = chroma.mix(color, DARK_BG, 0.3);
  } 
  // Handle dark colors
  else if (l < 0.4 && s <= 0.5) {
    // Lighten dark colors without increasing saturation
    adjusted = chroma.mix(color, 'white', 0.3);
  }

  // Ensure the adjusted color meets minimum contrast with dark background
  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  
  // Try to adjust the color up to 3 times to meet contrast requirements
  while (chroma.contrast(adjusted, DARK_BG) < MIN_BG_CONTRAST && attempts < MAX_ATTEMPTS) {
    // Gradually lighten the color if needed for contrast
    adjusted = chroma.mix(adjusted, 'white', 0.2);
    attempts++;
  }

  // If contrast requirements still aren't met after all attempts, use fallback color
  if (chroma.contrast(adjusted, DARK_BG) < MIN_BG_CONTRAST) {
    adjusted = chroma(FALLBACK_COLOR);
  }

  // Determine text color for dark mode based on contrast
  const textColorOnActionColor_dark =
    chroma.contrast(adjusted, 'white') >= MIN_TEXT_CONTRAST ? '#fff' : '#000';

  // Return all color tokens
  return {
    // Light mode tokens
    actionColor_light: color.hex(),                      // Main color for light mode
    actionColorDarker_light: chroma.mix(color, '#000', 0.2).hex(),  // Darker variant
    actionColorLighter_light: chroma.mix(color, '#fff', 0.2).hex(), // Lighter variant
    textColorOnActionColor_light,                        // Text color for light mode
    
    // Dark mode tokens
    actionColor_dark: adjusted.hex(),                    // Main color for dark mode
    actionColorDarker_dark: chroma.mix(adjusted, '#000', 0.2).hex(),  // Darker variant
    actionColorLighter_dark: chroma.mix(DARK_BG, adjusted, 0.2).hex(), // Lighter variant
    textColorOnActionColor_dark,                         // Text color for dark mode
  };
}