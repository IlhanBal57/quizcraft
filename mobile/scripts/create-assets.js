const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid PNG (1x1 transparent pixel)
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const files = ['favicon.png', 'icon.png', 'splash.png', 'adaptive-icon.png'];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`Created: ${filePath}`);
});

console.log('\nAll asset files created successfully!');
console.log('Note: Replace these with proper images for production.');
