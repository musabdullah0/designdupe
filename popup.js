function ensureContentScriptInjected(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) {
            displayError("Cannot access the current tab.");
            return;
        }

        const url = tabs[0].url;
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
            displayError("This extension cannot run on this page due to Chrome's security policy.");
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, function (response) {
            if (chrome.runtime.lastError || !response) {
                // Content script is not injected, inject it now
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }).then(() => {
                    callback();
                }).catch(error => {
                    displayError(`Failed to inject content script: ${error.message}`);
                });
            } else {
                // Content script is already injected
                callback();
            }
        });
    });
}

function sendMessageToContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' }, function (response) {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
                displayError(`Error: ${chrome.runtime.lastError.message}`);
                return;
            }

            if (response && response.colors) {
                displayColors(response.colors);
            } else {
                displayError("No color data received.");
            }

            if (response && response.fonts) {
                displayFonts(response.fonts);
            } else {
                displayError("No font data received.");
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    ensureContentScriptInjected(sendMessageToContentScript);
});

function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    document.body.appendChild(errorDiv);
}

function displayColors(colors) {
    const colorsDiv = document.getElementById('colors');
    colorsDiv.innerHTML = ''; // Clear existing colors
    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;
        colorBox.setAttribute('data-color', color);
        colorBox.addEventListener('click', () => copyToClipboard(color, 'color'));

        // Determine text color based on background color brightness
        const rgb = hexToRgb(color);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        if (brightness > 125) {
            colorBox.style.setProperty('--text-color', 'black');
        } else {
            colorBox.style.setProperty('--text-color', 'white');
        }

        colorsDiv.appendChild(colorBox);
    });
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function displayFonts(fonts) {
    const fontsDiv = document.getElementById('fonts');
    fontsDiv.innerHTML = ''; // Clear existing fonts
    fonts.forEach(font => {
        const fontBox = document.createElement('div');
        fontBox.className = 'font-box';
        fontBox.textContent = font;
        fontBox.style.fontFamily = font;
        fontBox.addEventListener('click', () => copyToClipboard(font, 'font'));
        fontsDiv.appendChild(fontBox);
    });
}

function copyToClipboard(text, type) {
    let copyText = text;
    if (type === 'color') {
        copyText = rgbToHex(text);
    }
    navigator.clipboard.writeText(copyText).then(() => {
        showMessage(`Copied ${type}: ${copyText} to clipboard!`);
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

function rgbToHex(color) {
    // If it's already a hex color, return it
    if (color.startsWith('#')) {
        return color;
    }

    // Create a temporary element to use the browser's color parsing
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    // Extract RGB values
    const rgbValues = computedColor.match(/\d+/g);

    if (rgbValues && rgbValues.length >= 3) {
        // Convert RGB to hex
        return '#' + rgbValues.slice(0, 3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // If conversion fails, return the original color
    return color;
}

function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 2000);
}