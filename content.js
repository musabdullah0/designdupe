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
    const usedFonts = new Set();
    const textNodes = [];

    // Recursive function to get all text nodes
    function getTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            textNodes.push(node);
        } else {
            for (let child of node.childNodes) {
                getTextNodes(child);
            }
        }
    }

    // Get all text nodes in the body
    getTextNodes(document.body);

    // Check each text node for its font
    textNodes.forEach(node => {
        const element = node.parentElement;
        if (element) {
            const style = window.getComputedStyle(element);
            const fontFamily = style.fontFamily.split(',')[0].trim().replace(/['"]+/g, '');
            if (fontFamily !== 'serif' && fontFamily !== 'sans-serif' && fontFamily !== 'monospace') {
                usedFonts.add(fontFamily);
            }
        }
    });

    return Array.from(usedFonts);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({status: 'ok'});
    } else if (request.action === 'extractData') {
      sendResponse({
        colors: extractTopColors(),
        fonts: extractFonts()
      });
    }
    return true;  // Indicates that sendResponse will be called asynchronously
  });