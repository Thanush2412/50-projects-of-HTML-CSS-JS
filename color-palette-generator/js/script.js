// DOM Elements
const baseColorInput = document.getElementById('baseColor');
const generateBtn = document.getElementById('generateBtn');
const paletteTypeSelect = document.getElementById('paletteType');
const paletteContainer = document.getElementById('paletteContainer');
const savedPalettesContainer = document.querySelector('.saved-palettes-container');

// Color conversion utilities
const rgbToHex = (r, g, b) => '#' + [r, g, b]
    .map(x => Math.round(x).toString(16).padStart(2, '0'))
    .join('');

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

// Convert HSL to RGB
const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
};

// Generate color palettes
const generatePalette = () => {
    const baseColor = baseColorInput.value;
    const type = paletteTypeSelect.value;
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [];

    switch (type) {
        case 'analogous':
            colors = [
                { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l },
                { h: (hsl.h - 15 + 360) % 360, s: hsl.s, l: hsl.l },
                { h: hsl.h, s: hsl.s, l: hsl.l },
                { h: (hsl.h + 15) % 360, s: hsl.s, l: hsl.l },
                { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }
            ];
            break;

        case 'complementary':
            colors = [
                { h: hsl.h, s: hsl.s, l: hsl.l },
                { h: hsl.h, s: hsl.s - 20, l: hsl.l + 10 },
                { h: hsl.h, s: hsl.s - 10, l: hsl.l + 5 },
                { h: (hsl.h + 180) % 360, s: hsl.s - 10, l: hsl.l + 5 },
                { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }
            ];
            break;

        case 'triadic':
            colors = [
                { h: hsl.h, s: hsl.s, l: hsl.l },
                { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
                { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l },
                { h: (hsl.h + 60) % 360, s: hsl.s - 10, l: hsl.l + 10 },
                { h: (hsl.h + 180) % 360, s: hsl.s - 10, l: hsl.l + 10 }
            ];
            break;

        case 'monochromatic':
            colors = [
                { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 30, 0) },
                { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 15, 0) },
                { h: hsl.h, s: hsl.s, l: hsl.l },
                { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 15, 100) },
                { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 30, 100) }
            ];
            break;
    }

    return colors.map(color => {
        const rgb = hslToRgb(color.h, color.s, color.l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    });
};

// Display the generated palette
const displayPalette = (colors) => {
    paletteContainer.innerHTML = colors.map(color => `
        <div class="color-swatch" style="background-color: ${color}">
            <div class="color-info">${color}</div>
        </div>
    `).join('');

    // Add click to copy functionality
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.querySelector('.color-info').textContent;
            navigator.clipboard.writeText(color);
            showToast('Color copied to clipboard!');
        });
    });
};

// Save palette
const savePalette = (colors) => {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    const newPalette = {
        id: Date.now(),
        colors,
        timestamp: new Date().toLocaleString()
    };
    savedPalettes.push(newPalette);
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
    displaySavedPalettes();
};

// Display saved palettes
const displaySavedPalettes = () => {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    savedPalettesContainer.innerHTML = savedPalettes.map(palette => `
        <div class="saved-palette" data-id="${palette.id}">
            <div class="saved-palette-colors">
                ${palette.colors.map(color => 
                    `<div class="saved-palette-color" style="background-color: ${color}"></div>`
                ).join('')}
            </div>
            <div class="saved-palette-actions">
                <button onclick="loadPalette('${palette.colors.join(',')}')">Load</button>
                <button onclick="deletePalette(${palette.id})">Delete</button>
            </div>
            <small>${palette.timestamp}</small>
        </div>
    `).join('');
};

// Load a saved palette
const loadPalette = (colorsStr) => {
    const colors = colorsStr.split(',');
    baseColorInput.value = colors[0];
    displayPalette(colors);
};

// Delete a saved palette
const deletePalette = (id) => {
    const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
    const filteredPalettes = savedPalettes.filter(palette => palette.id !== id);
    localStorage.setItem('savedPalettes', JSON.stringify(filteredPalettes));
    displaySavedPalettes();
};

// Show toast notification
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Event listeners
generateBtn.addEventListener('click', () => {
    const colors = generatePalette();
    displayPalette(colors);
});

document.addEventListener('DOMContentLoaded', () => {
    const colors = generatePalette();
    displayPalette(colors);
    displaySavedPalettes();
});

// Add save button to palette container
const saveBtn = document.createElement('button');
saveBtn.textContent = 'Save Palette';
saveBtn.style.marginTop = '1rem';
paletteContainer.parentElement.insertBefore(saveBtn, paletteContainer.nextSibling);

saveBtn.addEventListener('click', () => {
    const colors = Array.from(paletteContainer.children)
        .map(swatch => swatch.querySelector('.color-info').textContent);
    savePalette(colors);
    showToast('Palette saved!');
});
