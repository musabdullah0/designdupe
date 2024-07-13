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
        const fontFamily = style.fontFamily.split(',').slice(0, 2).join(', ').replace(/['"]+/g, '');
        fonts.add(fontFamily.trim());
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