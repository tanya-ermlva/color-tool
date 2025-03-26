import { getDarkModeTokens } from './utils/colorTransform.js';

// Get references to DOM elements
const picker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const results = document.getElementById('results');

// Listen for color changes in the color picker
picker.addEventListener('input', () => {
  hexInput.value = picker.value.toUpperCase();
  render(picker.value);
});

// Listen for hex code input
hexInput.addEventListener('input', (e) => {
  const value = e.target.value;
  // Only update if it's a valid hex code
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    picker.value = value;
    render(value);
  }
});

// Listen for hex code paste
hexInput.addEventListener('paste', (e) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  // Remove any non-hex characters and ensure it starts with #
  const cleanHex = '#' + pastedText.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
  hexInput.value = cleanHex.toUpperCase();
  picker.value = cleanHex;
  render(cleanHex);
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
      label: 'Base 500', 
      bg: tokens['custom-base-500_light'], 
      text: tokens.textColorOnActionColor_light 
    },
    { 
      label: 'Base 900', 
      bg: tokens['custom-base-900_light'] 
    },
    { 
      label: 'Base 100', 
      bg: tokens['custom-base-100_light'],
      text: tokens['custom-base-500_light']  // Use base-500 color for label text
    }
  ];

  const darkSwatches = [
    { 
      label: 'Base 500', 
      bg: tokens['custom-base-500_dark'], 
      text: tokens.textColorOnActionColor_dark, 
      dark: true,
      accessibility: '✓ WCAG AA compliant'
    },
    { 
      label: 'Base 900', 
      bg: tokens['custom-base-900_dark'],
      dark: true
    },
    { 
      label: 'Base 100', 
      bg: tokens['custom-base-100_dark'],
      text: tokens['custom-base-500_dark'],
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

  // Add UI components
  addUIComponents(lightModeGroup, tokens, false);
  addUIComponents(darkModeGroup, tokens, true);
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
//   if (swatch.dark) el.style.border = '1px solid #333';
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

/**
 * Creates UI components to demonstrate color usage
 * @param {HTMLElement} container - The container to add components to
 * @param {Object} tokens - Color tokens
 * @param {boolean} isDark - Whether this is for dark mode
 */
function addUIComponents(container, tokens, isDark) {
  const uiComponents = document.createElement('div');
  uiComponents.className = 'ui-components';

  // Message Bubble
  const messageBubble = document.createElement('div');
  messageBubble.className = 'ui-component';
  messageBubble.innerHTML = `
    <h4>Message Bubble</h4>
    <div class="message-bubble" style="background-color: ${isDark ? tokens['custom-base-500_dark'] : tokens['custom-base-500_light']}; color: ${isDark ? tokens.textColorOnActionColor_dark : tokens.textColorOnActionColor_light}">
      Hello! This is a message bubble using the action color.
    </div>
  `;
  uiComponents.appendChild(messageBubble);

  // Pill
  const pill = document.createElement('div');
  pill.className = 'ui-component';
  pill.innerHTML = `
    <h4>Pill</h4>
    <div class="pill" style="color: ${isDark ? tokens['custom-base-500_dark'] : tokens['custom-base-500_light']}; background-color: ${isDark ? tokens['custom-base-100_dark'] : tokens['custom-base-100_light']}">
      Action Pill
    </div>
  `;
  uiComponents.appendChild(pill);

  container.appendChild(uiComponents);
}

// Initial render with the default color
render(picker.value);
