import { getDarkModeTokens } from './utils/colorTransform.js';
import chroma from 'https://unpkg.com/chroma-js@3.0.0/index.js';

// Get references to DOM elements
const picker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const results = document.getElementById('results');
const colorTypeIndicator = document.createElement('div');
colorTypeIndicator.className = 'color-type';
hexInput.parentNode.appendChild(colorTypeIndicator);

// Listen for color changes in the color picker
picker.addEventListener('input', () => {
  hexInput.value = picker.value.toUpperCase();
  updateColorType(picker.value);
  render(picker.value);
});

// Listen for hex code input
hexInput.addEventListener('input', (e) => {
  const value = e.target.value;
  // Only update if it's a valid hex code
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    picker.value = value;
    updateColorType(value);
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
  updateColorType(cleanHex);
  render(cleanHex);
});

function updateColorType(color) {
  const [h, s, l] = chroma(color).hsl();
  let type = '';
  
  // HSL values are in ranges:
  // H: 0-360 (degrees)
  // S: 0-1 (0-100%)
  // L: 0-1 (0-100%)
  
  if (l > 0.8) {
    type = `Light color (HSL: ${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, dark background mix + saturation adjustment)`;
  } else {
    type = `Color (HSL: ${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, contrast + saturation adjustment)`;
  }
  
  colorTypeIndicator.textContent = type;
}

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

  // Create a row for Base 500 variants
  const base500Row = document.createElement('div');
  base500Row.className = 'base500-row';
  
  // Add Base 500 variants to the row
  const base500Variants = [
    { 
      label: 'Base 500 (Background)', 
      bg: tokens['custom-base-500_dark'], 
      text: tokens.textColorOnActionColor_dark, 
      dark: true,
      accessibility: '✓ WCAG AA UI compliant'
    },
    { 
      label: 'Base 500 (Text)', 
      bg: tokens['action-color-text_dark'], 
      text: '#000000',
      dark: true,
      accessibility: '✓ WCAG AA Text compliant'
    }
  ];

  // Add Base 500 variants to the row
  for (const swatch of base500Variants) {
    base500Row.appendChild(createSwatch(swatch));
  }

  // Add the row to dark mode group
  darkModeGroup.appendChild(base500Row);

  // Define the remaining dark mode swatches
  const darkSwatches = [
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

  // Create and display light mode swatches
  for (const swatch of lightSwatches) {
    lightModeGroup.appendChild(createSwatch(swatch));
  }

  // Create and display remaining dark mode swatches
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
    <div class="pill" style="color: ${isDark ? tokens['action-color-text_dark'] : tokens['custom-base-500_light']}; background-color: ${isDark ? tokens['custom-base-100_dark'] : tokens['custom-base-100_light']}">
      Action Pill
    </div>
  `;
  uiComponents.appendChild(pill);

  // Text component
  const boldText = document.createElement('div');
  boldText.className = 'ui-component';
  boldText.innerHTML = `
    <h4>Text</h4>
    <div class="bold-text" style="color: ${isDark ? tokens['action-color-text_dark'] : tokens['custom-base-500_light']}">
      This is text using the action color
    </div>
  `;
  uiComponents.appendChild(boldText);

  // Messages Icon
  const messagesIcon = document.createElement('div');
  messagesIcon.className = 'ui-component';
  messagesIcon.innerHTML = `
    <h4>Messages Icon</h4>
    <div class="messages-icon" style="color: ${isDark ? tokens['action-color-text_dark'] : tokens['custom-base-500_light']}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
      <span>Conversations</span>
    </div>
  `;
  uiComponents.appendChild(messagesIcon);

  container.appendChild(uiComponents);
}

// Initial render with the default color
render(picker.value);
