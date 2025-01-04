import { globalState as state } from "./globalState.js";

async function fetchFile(url) {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    return { response, contentType };
}

function createDateElement() {
    const dateElement = document.createElement('div');
    dateElement.textContent = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    dateElement.style.textAlign = 'center';
    return dateElement;
}

function renderTextHeader(container, text, dateElement) {
    const headerClone = container.cloneNode(false);
    const preElement = document.createElement('pre');
    preElement.textContent = text;
    headerClone.appendChild(preElement);
    headerClone.appendChild(dateElement);
    container.replaceWith(headerClone);
}

function renderImageHeader(container, blob, dateElement) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);

    img.classList.add('receipt-image');
    const imageContainer = container.cloneNode(false);
    imageContainer.appendChild(img);
    imageContainer.appendChild(dateElement);
    container.replaceWith(imageContainer);
}

export async function loadHeader(basePath = '/business/') {
    const receiptHeader = document.getElementById('receipt-header');
    const { path: businessPath, header } = state.currBusinessConfig
    const { response, contentType } = await fetchFile(`${basePath}${businessPath}/${header}`);
    const dateElement = createDateElement();

    if (contentType.includes('text')) {
        const text = await response.text();
        
        renderTextHeader(receiptHeader, text, dateElement);
    }
    else if (contentType.includes('image')) {
        const blob = await response.blob();
        renderImageHeader(receiptHeader, blob, dateElement);
    }
    else {
        console.error('Unbekanntes Dateiformat:', contentType);
    }
}