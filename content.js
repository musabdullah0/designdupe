function extractTopColors() {
    const elements = document.body.getElementsByTagName('*');
    const colorMap = new Map();

    for (let element of elements) {
        if (isElementVisible(element)) {
            const style = window.getComputedStyle(element);
            const backgroundColor = style.backgroundColor;
            const color = style.color;
            const area = getElementArea(element);

            updateColorMap(colorMap, backgroundColor, area);
            updateColorMap(colorMap, color, area / 10); // Text color weighted less
        }
    }

    // Sort colors by area and get top 6
    const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([color, _]) => color);

    return sortedColors;
}

function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function getElementArea(element) {
    const rect = element.getBoundingClientRect();
    return rect.width * rect.height;
}

function updateColorMap(colorMap, color, area) {
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        const hexColor = rgbToHex(color);
        colorMap.set(hexColor, (colorMap.get(hexColor) || 0) + area);
    }
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) {
        return rgb;
    }

    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length < 3) {
        return rgb;
    }

    return '#' + rgbValues.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function extractFonts() {
    const elements = document.getElementsByTagName('*');
    const fonts = new Set();

    for (let element of elements) {
        const style = window.getComputedStyle(element);
        const specifiedFontFamily = style.getPropertyValue('font-family');
        const computedFontFamily = style.fontFamily;

        // Check if the computed font family matches one of the specified fonts
        const specifiedFonts = specifiedFontFamily.split(',').map(font => font.trim().replace(/['"]+/g, ''));
        const computedFonts = computedFontFamily.split(',').map(font => font.trim().replace(/['"]+/g, ''));

        for (let font of specifiedFonts) {
            if (computedFonts.includes(font) && font !== 'serif' && font !== 'sans-serif' && font !== 'monospace') {
                fonts.add(font);
                break; // Only add the first matching font
            }
        }
    }

    return Array.from(fonts);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractData') {
        sendResponse({
            colors: extractTopColors(),
            fonts: extractFonts()
        });
    }
});