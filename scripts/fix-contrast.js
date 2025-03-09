const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js');

function adjustColorForContrast(color, backgroundColor, targetRatio = 4.5) {
  let adjustedColor = chroma(color);
  
  // Calculate current contrast ratio
  let currentRatio = chroma.contrast(adjustedColor, backgroundColor);
  
  // If contrast is too low, adjust the color
  while (currentRatio < targetRatio) {
    if (chroma(backgroundColor).luminance() > 0.5) {
      // For light backgrounds, darken the text
      adjustedColor = adjustedColor.darken(0.1);
    } else {
      // For dark backgrounds, lighten the text
      adjustedColor = adjustedColor.brighten(0.1);
    }
    currentRatio = chroma.contrast(adjustedColor, backgroundColor);
  }
  
  return adjustedColor.hex();
}

async function fixContrast() {
  const configPath = path.join(process.cwd(), 'tailwind.config.ts');
  
  try {
    // Read current Tailwind config
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Parse the colors from the config
    const themeColors = configContent.match(/colors:\s*{[\s\S]*?}/)[0];
    
    // Adjust text colors that have poor contrast with white background
    const adjustedConfig = configContent.replace(
      themeColors,
      themeColors.replace(/'#[0-9a-fA-F]{6}'/g, (match) => {
        const color = match.replace(/'/g, '');
        const whiteBackground = '#FFFFFF';
        
        // Check contrast with white background
        const contrast = chroma.contrast(color, whiteBackground);
        
        if (contrast < 4.5) {
          const adjustedColor = adjustColorForContrast(color, whiteBackground);
          return `'${adjustedColor}'`;
        }
        return match;
      })
    );

    // Write the adjusted config back
    fs.writeFileSync(configPath, adjustedConfig);
    console.log('Updated Tailwind config with contrast-safe colors');
    
  } catch (error) {
    console.error('Error fixing contrast:', error);
  }
}

fixContrast();