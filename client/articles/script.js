import { api } from "../modules/api.js";
import { createCode39Barcode } from "../modules/barcode.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("articleForm");
  const articleIdField = document.getElementById("articleId");
  const articleNumField = document.getElementById("articleNum");
  const articleNameField = document.getElementById("articleName");
  const articlePriceField = document.getElementById("articlePrice");
  const cancelEditBtn = document.getElementById("cancelEdit");
  const articlesTableBody = document.querySelector("#articlesTable tbody");

  let isEditing = false;

   // Load initially
  await loadArticles();

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idVal = articleIdField.value.trim();
    const articleNumVal = articleNumField.value.trim();
    const articleNameVal = articleNameField.value.trim();
    const articlePriceVal = parseFloat(articlePriceField.value.trim()) || 0;

    if (isEditing) {
      // Edit article
      try {
        await api.editArticle(articleNumVal, {
          name: articleNameVal,
          price: articlePriceVal,
          vat: "C",
        }, idVal);
        resetForm();
        await loadArticles();
        isEditing = false;
      } catch (err) {
        console.error("error during editing of the article:", err);
      }
    } else {
      // Add new article
      try {
        await api.addArticle({
          article_num: articleNumVal,
          name: articleNameVal,
          price: articlePriceVal,
          vat: "C",
        });
        resetForm();
        await loadArticles();
      } catch (err) {
        console.error("error during adding article:", err);
      }
    }
  });

  // Cancel button
  cancelEditBtn.addEventListener("click", () => {
    resetForm();
    isEditing = false;
  });

  // Load articles and populate the table
  async function loadArticles() {
    articlesTableBody.innerHTML = "";
    try {
      const articles = await api.getArticleMap();
      Object.entries(articles).forEach(([articleNum, { id, name, price }]) => {
        const row = document.createElement("tr");

        // Database ID
        const idCell = document.createElement("td");
        idCell.classList.add("mdl-data-table__cell--non-numeric");
        idCell.textContent = id;
        row.appendChild(idCell);

        // Article number
        const numCell = document.createElement("td");
        numCell.classList.add("mdl-data-table__cell--non-numeric");
        numCell.textContent = articleNum;
        row.appendChild(numCell);

        // Name
        const nameCell = document.createElement("td");
        nameCell.classList.add("mdl-data-table__cell--non-numeric");
        nameCell.textContent = name;
        row.appendChild(nameCell);

        // Price
        const priceCell = document.createElement("td");
        priceCell.textContent = price.toFixed(2);
        row.appendChild(priceCell);

        // Barcode cell
        const barcodeCell = document.createElement("td");
        barcodeCell.classList.add("mdl-data-table__cell--non-numeric");

        // Get the SVG from the function.
        // Depending on the implementation, it is either a complete element or a string.
        const barcodeSVG = createCode39Barcode(articleNum, 30);

        // Variant A: If `barcodeSVG` is a complete DOM element:
        if (barcodeSVG instanceof SVGElement) {
          barcodeCell.appendChild(barcodeSVG);
        } else if (typeof barcodeSVG === 'string') {
          // Variant B: If `barcodeSVG` is a pure SVG string markup
          barcodeCell.innerHTML = barcodeSVG;
        }

        // Optional for screen readers
        barcodeCell.setAttribute(
          "aria-label",
          `barcode for article ${articleNum}`
        );

        row.appendChild(barcodeCell);

        // Actions
        const actionCell = document.createElement("td");
        actionCell.classList.add("mdl-data-table__cell--non-numeric");

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "mdl-button mdl-js-button mdl-button--icon";
        editBtn.innerHTML = `<i class="material-icons">edit</i>`;
        editBtn.addEventListener("click", () => {
          // Populate form fields
          articleIdField.value = id;
          articleNumField.value = articleNum;
          articleNameField.value = name;
          articlePriceField.value = price;
          isEditing = true;
        });
        actionCell.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "mdl-button mdl-js-button mdl-button--icon mdl-button--accent";
        deleteBtn.innerHTML = `<i class="material-icons">delete</i>`;
        deleteBtn.addEventListener("click", async () => {
          if (confirm("really delete this article?")) {
            await api.deleteArticleByArticleNum(articleNum);
            await loadArticles();
            resetForm();
          }
        });
        actionCell.appendChild(deleteBtn);

        row.appendChild(actionCell);
        articlesTableBody.appendChild(row);
      });
    } catch (error) {
      console.error("error during loading the article:", error);
    }
  }

  // Reset the form
  function resetForm() {
    articleIdField.value = "generated";
    articleNumField.value = "";
    articleNameField.value = "";
    articlePriceField.value = "";
    isEditing = false;
  }

  // On initial call
  resetForm();
});