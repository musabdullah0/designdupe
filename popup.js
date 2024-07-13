document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'extractData'}, function(response) {
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