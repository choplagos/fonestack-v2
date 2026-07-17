// Postinstall script for generating favicons
// In production, use sharp or svgexport to generate proper PNG favicons from SVG

const fs = require('fs');
const path = require('path');

// Create placeholder favicons - replace with actual PNG generation in production
const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('✅ Fonestack SEO assets initialized');
console.log('📝 Note: Replace SVG placeholder files with actual PNG favicons for production');