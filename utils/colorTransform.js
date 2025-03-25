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
  const MIN_UI_CONTRAST = 2;      // Minimum contrast for UI elements (lower threshold)
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
    // For dark colors in light mode, try to preserve the color while ensuring contrast
    if (l < 0.4) {
      // Lighten dark colors just enough to meet contrast requirements
      let attempts = 0;
      while (chroma.contrast(color, 'white') < MIN_TEXT_CONTRAST && attempts < 3) {
        color = chroma.mix(color, 'white', 0.1);
        attempts++;
      }
      // If we still don't have good contrast, use a darker version of the original color
      if (chroma.contrast(color, 'white') < MIN_TEXT_CONTRAST) {
        color = chroma.mix(color, 'black', 0.2);
      }
      textColorOnActionColor_light = '#fff';
    } else {
      // For other colors, determine text color based on contrast
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
  }

  // Adjust color based on its HSL properties for dark mode
  let adjusted = color;
  
  // Handle light colors in dark mode
  if (l > 0.6) {
    // Darken light colors to make them less shiny in dark mode
    adjusted = chroma.mix(color, 'black', 0.4);
    // If saturation is too high after darkening, reduce it
    const currentSaturation = chroma(adjusted).get('hsl.s');
    if (currentSaturation > 0.8) {
      adjusted = chroma(adjusted).set('hsl.s', 0.8);
    }
  }
  // Handle dark saturated colors (including dark reds)
  else if (l < 0.4 && s > 0.5) {
    // For dark saturated colors, just lighten very slightly with white
    adjusted = chroma.mix(color, 'white', 0.04);
    // Keep high saturation for dark colors
    const currentSaturation = chroma(adjusted).get('hsl.s');
    if (currentSaturation > 0.9) {  // Only reduce if extremely high
      adjusted = chroma(adjusted).set('hsl.s', 0.9);
    }
  }
  // Handle bright medium colors (high saturation, medium lightness)
  else if (l >= 0.4 && l <= 0.75 && s > 0.5) {
    // For very saturated colors, reduce saturation first
    if (s > 0.8) {
      adjusted = chroma(color).set('hsl.s', 0.8);
    }
    // Then mix with dark background - more mixing for higher saturation
    const mixAmount = Math.min(0.4 + (s * 0.2), 0.6);  // Mix 40-60% depending on saturation
    adjusted = chroma.mix(adjusted, DARK_BG, mixAmount);
    // If still too saturated, reduce further
    const currentSaturation = chroma(adjusted).get('hsl.s');
    if (currentSaturation > 0.7) {
      adjusted = chroma(adjusted).set('hsl.s', 0.7);
    }
  }
  // Handle medium-light unsaturated colors
  else if (l >= 0.4 && l <= 0.75 && s <= 0.5) {
    // Mix with dark background
    adjusted = chroma.mix(color, DARK_BG, 0.3);
    // If saturation decreased too much, increase it slightly
    const currentSaturation = chroma(adjusted).get('hsl.s');
    if (currentSaturation < s * 0.8) {  // If saturation dropped more than 20% from original
      adjusted = chroma(adjusted).set('hsl.s', Math.min(s * 0.8, 0.8));
    }
  } 
  // Handle dark unsaturated colors
  else if (l < 0.4 && s <= 0.5) {
    // Lighten very slightly with white
    adjusted = chroma.mix(color, 'white', 0.04);
    // If saturation decreased too much, increase it slightly
    const currentSaturation = chroma(adjusted).get('hsl.s');
    if (currentSaturation < s * 0.8) {  // If saturation dropped more than 20% from original
      adjusted = chroma(adjusted).set('hsl.s', Math.min(s * 0.8, 0.8));
    }
  }

  // Ensure the adjusted color meets minimum contrast with dark background
  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  
  // Try to adjust the color up to 3 times to meet contrast requirements
  while (chroma.contrast(adjusted, DARK_BG) < MIN_UI_CONTRAST && attempts < MAX_ATTEMPTS) {
    const currentSaturation = chroma(adjusted).get('hsl.s');
    // For dark colors, mix with less white
    const mixAmount = l < 0.4 ? 0.04 : 0.1;
    adjusted = chroma.mix(adjusted, 'white', mixAmount);
    // If saturation decreased too much, increase it slightly
    const newSaturation = chroma(adjusted).get('hsl.s');
    if (newSaturation < currentSaturation * 0.8) {  // If saturation dropped more than 20%
      adjusted = chroma(adjusted).set('hsl.s', Math.min(currentSaturation * 0.8, 0.8));
    }
    attempts++;
  }

  // If contrast requirements still aren't met after all attempts, use fallback color
  if (chroma.contrast(adjusted, DARK_BG) < MIN_UI_CONTRAST) {
    adjusted = chroma(FALLBACK_COLOR);
  }

  // Determine text color for dark mode based on contrast
  const textColorOnActionColor_dark =
    chroma.contrast(adjusted, 'white') >= MIN_TEXT_CONTRAST ? '#fff' : '#000';

  // Return all color tokens
  return {
    // Light mode tokens
    'custom-base-500_light': color.hex(),                      // Main color for light mode
    'custom-base-900_light': chroma.mix(color, '#000', 0.4).hex(),  // Darker variant
    'custom-base-100_light': chroma.mix(color, '#fff', 0.6).hex(), // Lighter variant
    textColorOnActionColor_light,                        // Text color for light mode
    
    // Dark mode tokens - all using UI contrast threshold
    'custom-base-500_dark': adjusted.hex(),                    // Main color for dark mode
    'custom-base-900_dark': (() => {
      // For dark colors, use minimal white mixing
      const mixAmount = l < 0.4 ? 0.15 : 0.3;
      let variant = chroma.mix(adjusted, 'white', mixAmount);
      // Ensure UI contrast threshold with minimal adjustments
      while (chroma.contrast(variant, DARK_BG) < MIN_UI_CONTRAST) {
        const currentSaturation = chroma(variant).get('hsl.s');
        variant = chroma.mix(variant, 'white', l < 0.4 ? 0.04 : 0.1);
        // Preserve saturation for dark colors
        const newSaturation = chroma(variant).get('hsl.s');
        if (newSaturation < currentSaturation * 0.8) {
          variant = chroma(variant).set('hsl.s', Math.min(currentSaturation * 0.8, 0.9));
        }
      }
      return variant.hex();
    })(),  // Lighter variant for dark mode
    'custom-base-100_dark': (() => {
      // Start with pure black and gradually lighten until we meet contrast
      let variant = chroma('#000000');
      while (chroma.contrast(variant, DARK_BG) < MIN_UI_CONTRAST) {
        const currentSaturation = chroma(variant).get('hsl.s');
        variant = chroma.mix(variant, adjusted, 0.04);  // Use minimal mixing
        // Preserve saturation for dark colors
        const newSaturation = chroma(variant).get('hsl.s');
        if (newSaturation < currentSaturation * 0.8) {
          variant = chroma(variant).set('hsl.s', Math.min(currentSaturation * 0.8, 0.9));
        }
      }
      return variant.hex();
    })(), // Darkest variant for dark mode
    textColorOnActionColor_dark,                         // Text color for dark mode
  };
}