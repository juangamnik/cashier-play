import { loadHeader } from "./header.js";

let positions = [];
let finalized = false;

function getVatRate(code) {
    if (!code || code === 'A') return 0.19;
    if (code === 'B') return 0.07;
    if (code === 'C') return 0.00;
    return 0;
}

function addArticleToReceipt(article, quantity) {
    const receipt = document.getElementById('receipt');
    const vatRate = getVatRate(article.vat);
    const grossPerItem = article.price; 
    const grossLine = grossPerItem * quantity;
    const netPerItem = grossPerItem / (1 + vatRate);
    const netLine = netPerItem * quantity;
    const taxLine = grossLine - netLine;

    positions.push({ article, quantity, netLine, taxLine, grossLine });

    const entry = document.createElement('div');
    entry.classList.add('receipt-entry');
    entry.innerHTML = 
    `${article.name} (${article.id}) [${article.vat ? article.vat : 'A'}]<br>` +
    `${quantity} x ${grossPerItem.toFixed(2)}€ = ${grossLine.toFixed(2)}€`;
    receipt.appendChild(entry);
    receipt.scrollTop = receipt.scrollHeight;
}

function finalizeReceipt() {
    const receipt = document.getElementById('receipt');
    if (positions.length === 0) return;

    let netto = 0;
    let vatA = 0;
    let vatB = 0;
    let vatC = 0;
    let brutto = 0;

    positions.forEach(({ article, netLine, taxLine, grossLine }) => {
        netto += netLine;
        brutto += grossLine;
        if (!article.vat || article.vat === 'A') {
            vatA += taxLine;
        } else if (article.vat === 'B') {
            vatB += taxLine;
        } else if (article.vat === 'C') {
            vatC += taxLine;
        }
    });

    const summary = document.createElement('div');
    summary.classList.add('receipt-summary');
    summary.innerHTML = 
        `Netto: ${netto.toFixed(2)}€<br>` +
        `Steuer (A=19%): ${vatA.toFixed(2)}€<br>` +
        `Steuer (B=7%): ${vatB.toFixed(2)}€<br>` +
        `Steuer (C=0%): ${vatC.toFixed(2)}€<br>` +
        `Brutto: ${brutto.toFixed(2)}€<br>`;
    receipt.appendChild(summary);
    receipt.scrollTop = receipt.scrollHeight;
    finalized = true;
}

function clearReceipt() {
    const receipt = document.getElementById('receipt');
    positions = [];
    finalized = false;
    receipt.innerHTML = `
        <div class="receipt-header" id="receipt-header">
        </div>
    `;
    loadHeader();
}

export { clearReceipt, finalizeReceipt, addArticleToReceipt, finalized }