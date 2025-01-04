
function createCode39Barcode(inputNumber, height = 100) {
    const code39Chars = {
        "0": "101001101101", "1": "110100101011", "2": "101100101011", "3": "110110010101",
        "4": "101001101011", "5": "110100110101", "6": "101100110101", "7": "101001011011",
        "8": "110100101101", "9": "101100101101", "-": "101001010011", "$": "101001001011",
        "%": "101000101011", ".": "110010101101", "/": "101000101101", "+": "101000110101",
        "*": "100101101101"
    };

    const paddedInput = inputNumber.toString().padStart(4, '0');
    const barcodeData = `*${paddedInput}*`;
    const binaryRepresentation = barcodeData
        .split('')
        .map(char => code39Chars[char])
        .join('0');

    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("xmlns", svgNamespace);
    svg.setAttribute("viewBox", "0 0 " + (binaryRepresentation.length * 2) + ` ${String(height)}`);
    svg.setAttribute("height", String(height));
    svg.setAttribute("width", binaryRepresentation.length * 2);

    let x = 0;
    for (const bit of binaryRepresentation) {
        if (bit === '1') {
            const rect = document.createElementNS(svgNamespace, "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", 2);
            rect.setAttribute("height", height);
            rect.setAttribute("fill", "black");
            svg.appendChild(rect);
        }
        x += 2;
    }

    return svg;
}

export { createCode39Barcode }