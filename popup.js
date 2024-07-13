document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' }, function (response) {
            displayColors(response.colors);
            displayFonts(response.fonts);
        });
    });
});

function displayColors(colors) {
    const colorsDiv = document.getElementById('colors');
    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;
        colorBox.title = color;
        colorBox.addEventListener('click', () => copyToClipboard(color));
        colorsDiv.appendChild(colorBox);
    });
}

function displayFonts(fonts) {
    const fontsDiv = document.getElementById('fonts');
    fonts.forEach(font => {
        const fontElement = document.createElement('p');
        fontElement.textContent = font;
        fontElement.style.fontFamily = font;
        fontsDiv.appendChild(fontElement);
    });
}

function copyToClipboard(color) {
    const hexColor = rgbToHex(color);
    navigator.clipboard.writeText(hexColor).then(() => {
        showMessage(`Copied ${hexColor} to clipboard!`);
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

function rgbToHex(rgb) {
    // If the color is already in hex format, return it as is
    if (rgb.startsWith('#')) {
        return rgb;
    }

    // Extract the RGB values
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length !== 3) {
        return rgb; // Return original value if it's not a valid RGB color
    }

    // Convert RGB to hex
    return '#' + rgbValues.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 2000);
}