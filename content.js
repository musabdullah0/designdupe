function extractColors() {
    const elements = document.getElementsByTagName('*');
    const colors = new Set();

    for (let element of elements) {
        const style = window.getComputedStyle(element);
        colors.add(style.color);
        colors.add(style.backgroundColor);
    }

    return Array.from(colors).filter(color => color !== 'rgba(0, 0, 0, 0)');
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
            colors: extractColors(),
            fonts: extractFonts()
        });
    }
});