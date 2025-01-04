
async function inlineSVGsInImages(clonedElement) {
    const imgElements = clonedElement.querySelectorAll('img[src]');
  
    for (const img of imgElements) {
      try {
        // Load the SVG file
        const response = await fetch(img.src);
        if (!response.ok) {
          console.warn(`SVG konnte nicht geladen werden: ${img.src}`);
          continue;
        }
  
        const svgText = await response.text();
  
        // Create a data URL from the SVG content
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
  
        // Replace the `src` attribute of the `<img>` tag with the data URL
        img.src = svgDataUrl;
      } catch (error) {
        console.error(`Fehler beim Laden des SVGs: ${img.src}`, error);
      }
    }
  }

  async function prepareHTMLForBackend() {
    const receiptElement = document.querySelector("#receipt");
    if (!receiptElement) {
      throw new Error("Kein Element mit ID 'receipt' gefunden.");
    }
  
    // Clone element.
    const clone = receiptElement.cloneNode(true);
  
    // Embed SVGs as data URLs inline in the cloned element
    await inlineSVGsInImages(clone);
  
    function applyInlineStyles(sourceElem, targetElem) {
      const computedStyle = window.getComputedStyle(sourceElem);
      for (const key of computedStyle) {
        targetElem.style.setProperty(key, computedStyle.getPropertyValue(key), computedStyle.getPropertyPriority(key));
      }
      for (let i = 0; i < sourceElem.children.length; i++) {
        applyInlineStyles(sourceElem.children[i], targetElem.children[i]);
      }
    }
    applyInlineStyles(receiptElement, clone);
  
    // Create Minimal-HTML
    const wrapper = document.createElement("div");
    wrapper.appendChild(clone);
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Receipt</title>
  </head>
  <body style="margin:0;padding:0;">
    ${wrapper.innerHTML}
  </body>
  </html>
    `;
}
  
/**
 * Main function: Takes the #receipt element, converts it to inline styles,
 * builds minimal HTML, sends it to the server, and triggers printing.
 */
async function printReceipt() {
    try {
      const minimalHtml = await prepareHTMLForBackend();
  
      // Send to the backend
      const response = await fetch("/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html: minimalHtml }),
      });
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Fehler beim Drucken: ${text}`);
      }
  
      // Display the message in a dialog
      alert("Successfully sent to the server and print job executed.");
    } catch (error) {
      alert("Error during printing:", error);
    }
  }
  
  export { printReceipt };