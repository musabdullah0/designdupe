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
        colorBox.addEventListener('click', () => copyToClipboard(color, 'color'));
        colorsDiv.appendChild(colorBox);
    });
}

function displayFonts(fonts) {
    const fontsDiv = document.getElementById('fonts');
    fonts.slice(0, 2).forEach(font => {
        const fontElement = document.createElement('p');
        fontElement.className = 'font-item';
        fontElement.textContent = font;
        fontElement.style.fontFamily = font;
        fontElement.addEventListener('click', () => copyToClipboard(font, 'font'));
        fontsDiv.appendChild(fontElement);
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

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) {
        return rgb;
    }

    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length !== 3) {
        return rgb;
    }

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