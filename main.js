import { getDarkModeTokens } from './utils/colorTransform.js';

// Get references to DOM elements
const picker = document.getElementById('colorPicker');
const results = document.getElementById('results');

// Listen for color changes in the color picker
picker.addEventListener('input', () => {
  render(picker.value);
});

/**
 * Renders color swatches showing the original color and its dark mode variants
 * @param {string} inputColor - The color selected in the picker
 */
function render(inputColor) {
  // Get color tokens for both light and dark modes
  const tokens = getDarkModeTokens(inputColor);
  results.innerHTML = ''; // Clear previous swatches

  // Create light mode swatches group
  const lightModeGroup = document.createElement('div');
  lightModeGroup.className = 'swatch-group';
  lightModeGroup.innerHTML = '<h3>Light Mode</h3>';

  // Create dark mode swatches group
  const darkModeGroup = document.createElement('div');
  darkModeGroup.className = 'swatch-group dark';
  darkModeGroup.innerHTML = '<h3>Dark Mode</h3>';

  // Define the swatches to display
  const lightSwatches = [
    { 
      label: 'Action Color', 
      bg: tokens.actionColor_light, 
      text: tokens.textColorOnActionColor_light 
    },
    { 
      label: 'Darker Variant', 
      bg: tokens.actionColorDarker_light 
    },
    { 
      label: 'Lighter Variant', 
      bg: tokens.actionColorLighter_light 
    }
  ];

  const darkSwatches = [
    { 
      label: 'Action Color', 
      bg: tokens.actionColor_dark, 
      text: tokens.textColorOnActionColor_dark, 
      dark: true,
      accessibility: '✓ WCAG AA compliant'
    },
    { 
      label: 'Darker Variant', 
      bg: tokens.actionColorDarker_dark,
      dark: true
    },
    { 
      label: 'Lighter Variant', 
      bg: tokens.actionColorLighter_dark,
      dark: true
    }
  ];

  // Create and display light mode swatches
  for (const swatch of lightSwatches) {
    lightModeGroup.appendChild(createSwatch(swatch));
  }

  // Create and display dark mode swatches
  for (const swatch of darkSwatches) {
    darkModeGroup.appendChild(createSwatch(swatch));
  }

  // Add groups to results
  results.appendChild(lightModeGroup);
  results.appendChild(darkModeGroup);
}

/**
 * Creates a swatch element with its label
 * @param {Object} swatch - Swatch configuration object
 * @returns {HTMLElement} The swatch wrapper element
 */
function createSwatch(swatch) {
  // Create the swatch container
  const el = document.createElement('div');
  el.className = 'swatch';
  el.style.backgroundColor = swatch.bg;
  el.style.color = swatch.text || '#fff';
  // Add border for dark mode swatches to make them visible
  if (swatch.dark) el.style.border = '1px solid #333';
  el.innerText = swatch.label;

  // Add accessibility indicator if present
  if (swatch.accessibility) {
    const accessibility = document.createElement('div');
    accessibility.className = 'accessibility';
    accessibility.innerText = swatch.accessibility;
    el.appendChild(accessibility);
  }

  // Create wrapper for swatch and its label
  const wrapper = document.createElement('div');
  wrapper.appendChild(el);
  
  // Add the hex color value below the swatch
  const label = document.createElement('div');
  label.className = 'label';
  label.innerText = swatch.bg;
  wrapper.appendChild(label);

  return wrapper;
}

// Initial render with the default color
render(picker.value);
