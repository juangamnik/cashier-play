import { createCode39Barcode } from "./barcode.js";
import { globalState as state } from "./globalState.js";
import { createMemoizedFunction } from "./optimization.js";

async function fetchAndProcessArticles(basePath = '/business/') {
    const { path: businessPath, articles: articlesFile } = state.currBusinessConfig
    const jsonContent = (await (await fetch(`${basePath}${businessPath}/${articlesFile}`)).json())
    const articles = jsonContent
        .sort((a, b) => a.category.localeCompare(b.category))
        .map((category, categoryIndex, categories) => ({
            ...category,
            items: category.items
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item, itemIndex) => ({
                    ...item,
                    id: (
                        categories
                            .slice(0, categoryIndex)
                            .reduce((sum, c) => sum + c.items.length, 0)
                        + itemIndex + 1
                    ).toString().padStart(4, '0')
                }))
        }));
    return articles;
}

function buildArticlesTable() {
    const tableBody = document.createElement('tbody');
    tableBody.id = 'articles-table-body';

    const overlay = document.createElement('div');
    overlay.classList.add('barcode-overlay');
    document.body.appendChild(overlay);
    let overlayTimeout;

    (state.filteredArticles ?
        state.filteredArticles : state.articles).forEach(({ category, items }, index, arr) => {
        if (index === 0 || category !== arr[index - 1].category) {
            const categoryRow = document.createElement('tr');
            categoryRow.classList.add('category-separator');
            categoryRow.innerHTML = `
                <td colspan="4">
                    <span class="toggle-symbol">⊖</span> ${category}
                </td>
            `;
            tableBody.appendChild(categoryRow);
        }

        items.forEach(({ id, name, price, vat }) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="IN">${id}</td>
                <td class="Description">${name}</td>
                <td class="Price">${price.toFixed(2)}</td>
                <td class="S">${vat ? vat : 'A'}</td>
            `;
            
            const articleCell = row.querySelector('.IN');

            // Add hover logic for barcode overlay
            articleCell.addEventListener('mouseenter', (event) => {
                overlayTimeout = setTimeout(() => {
                    const barcodeSvg = createCode39Barcode(id);
                    overlay.innerHTML = ''; // Clear previous content
                    overlay.appendChild(barcodeSvg);

                    // Add article number below the barcode
                    const articleNumber = document.createElement('div');
                    articleNumber.textContent = `Item Number: ${id}`;
                    articleNumber.classList.add('barcode-article-number');
                    overlay.appendChild(articleNumber);

                    overlay.style.left = `${event.clientX + 10}px`; // Closer to mouse
                    overlay.style.top = `${event.clientY + 10}px`;  // Closer to mouse
                    overlay.style.opacity = '1';
                    overlay.style.visibility = 'visible';
                }, 300); // Delay for hover
            });

            articleCell.addEventListener('mouseleave', () => {
                clearTimeout(overlayTimeout);
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.visibility = 'hidden';
                    overlay.innerHTML = '';
                }, 300); // Fade-out duration
            });

            tableBody.appendChild(row);
        });
    });

    initializeCategoryToggles(tableBody);

    return tableBody;
}

/*
 * Inserts the generated element into the DOM
 */
function insertArticlesTable(tableBody) {
    const existingTableBody = document.getElementById('articles-table-body');
    if (existingTableBody) {
        existingTableBody.replaceWith(tableBody);
    } else {
        const table = document.querySelector('.articles-table-container table');
        table.appendChild(tableBody);
    }
}

// Create memoized function for building the articles table
let memoizedBuildTable;
resetCache();

function resetCache() {
    memoizedBuildTable = createMemoizedFunction(buildArticlesTable);
}

function fillArticlesTable(searchQuery) {
    const tableBody = memoizedBuildTable(searchQuery ? searchQuery : '');

    // Insert the table into the DOM
    insertArticlesTable(tableBody);
}

function toggleCategory(categoryRow) {
    const toggleSymbol = categoryRow.querySelector(".toggle-symbol");
    if (!toggleSymbol) return; // If the icon is not found, abort

    const isExpanded = toggleSymbol.textContent.trim() === "⊖";

    // Toggle the icon
    toggleSymbol.textContent = isExpanded ? "⊕" : "⊖";

    // Toggle the visibility of the relevant rows
    getRelevantRows(categoryRow).forEach(row =>
        row.classList.toggle("invisible", isExpanded)
    );
}

function getRelevantRows(categoryRow) {
    const rows = [];
    let nextRow = categoryRow.nextElementSibling;

    while (nextRow && !nextRow.classList.contains("category-separator")) {
        rows.push(nextRow);
        nextRow = nextRow.nextElementSibling;
    }

    return rows;
}

function updateExpandCollapseButtonState(categoryRows) {
    const button = document.getElementById('expand-collapse-all');
  
    const allCollapsed = Array.from(categoryRows).every(categoryRow => {
      const toggleSym = categoryRow.querySelector('.toggle-symbol');
      return toggleSym && toggleSym.textContent.trim() === '⊕';
    });
  
    button.textContent = allCollapsed ? '⊕' : '⊖';
  }

function initializeCategoryToggles(tableBody) {
    // Find all category rows
    const categoryRows = tableBody.querySelectorAll(".category-separator");

    // Add an event listener to each category row
    categoryRows.forEach(categoryRow => {
        categoryRow.addEventListener("click", () => {
            // Expand or collapse the category
            toggleCategory(categoryRow);
            updateExpandCollapseButtonState(categoryRows);
        });
    });
}

document.getElementById('expand-collapse-all').addEventListener('click', function () {
    const button = this;
    const currentSymbol = button.textContent.trim(); // ⊖ or ⊕
  
    // Collect all .category-separator elements
    const separators = document.querySelectorAll('.category-separator');
  
    if (currentSymbol === '⊖') {
      // "Expand all": For all currently showing "⊖" (isExpanded? false), call toggleCategory
      separators.forEach(separator => {
        const toggleSym = separator.querySelector('.toggle-symbol');
        if (toggleSym && toggleSym.textContent.trim() === '⊖') {
          toggleCategory(separator); 
        }
      });
      // Change button icon to "⊕"
      button.textContent = '⊕';
    } else {
      // "Collapse all": For all currently showing "⊕" (isExpanded? true), call toggleCategory
      separators.forEach(separator => {
        const toggleSym = separator.querySelector('.toggle-symbol');
        if (toggleSym && toggleSym.textContent.trim() === '⊕') {
          toggleCategory(separator);
        }
      });
      // Reset button icon to "⊖"
      button.textContent = '⊖';
    }
});

export { fillArticlesTable, fetchAndProcessArticles, resetCache };