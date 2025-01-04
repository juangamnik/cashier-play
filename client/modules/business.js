import { fetchAndProcessArticles, fillArticlesTable, resetCache as resetArticleTableCache } from "./articles.js";
import { globalState as state, globalStateHandler } from "./globalState.js";
import { loadHeader } from "./header.js";
import { clearReceipt } from "./receipt.js";
import { createArticlesIndex, resetCache as resetArticlesFilterCache } from "./search.js";
import { api } from "./api.js";

async function fetchFolders(basePath) {
  // 1) Fetch directory listing as HTML
  const resp = await fetch(basePath);
  if (!resp.ok) {
      throw new Error(`Fehler beim Abrufen des Directory Listings: ${resp.statusText}`);
  }
  const html = await resp.text();

  // 2) Parse the HTML document
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 3) Extract folder names
  return Array.from(doc.querySelectorAll('#files a span.name')) // Select only span.name in directories
      .map(span => span.textContent.trim()); // Extract the text content of the <span>
}
  
/**
 * Loads the configuration of a single business.
 * @param {string} basePath - Base path (e.g., '/business/')
 * @param {string[]} folders - List of folder names
 * @returns {Promise<Object[]>} - List of business objects
 */
async function buildBusinessConfigs(basePath, folders) {
    const promises = folders.map(async folderName => {
      const configUrl = `${basePath}${folderName}/config.json`;
      try {
        const resp = await fetch(configUrl);
        if (!resp.ok) {
          throw new Error(`Fehler beim Abrufen der config.json von "${folderName}": ${resp.statusText}`);
        }
        return await resp.json();
      } catch (err) {
        console.error(`Fehler beim Laden der config.json in Ordner "${folderName}":`, err);
        return null;
      }
    });
  
    const results = await Promise.all(promises);
    return results.filter(Boolean); // Remove null entries
}
  

/**
 * Combination of fetching and processing the directory listing.
 * @param {string} basePath - Base path (e.g., '/business/')
 * @returns {Promise<Object[]>} - List of discovered businesses
 */
async function fetchBusinessConfigs(basePath = '/business/') {
    try {
      const folders = await fetchFolders(basePath);
  
      return [...(await buildBusinessConfigs(basePath, folders))]
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    catch (error) {
      console.error('Fehler beim Abrufen der Business-Configs:', error);
      return [];
    }
}

async function switchToBusiness(path) {
  const newBusinessConfig = state.businessConfigs.find((config) => config.path === path)
  // switch the config
  state.currBusinessConfig = newBusinessConfig

  resetArticleTableCache();

  resetArticlesFilterCache();

  clearReceipt();

  loadHeader();

  if(path === 'real') {
    const stored = await api.getArticleList();
    state.articles = [{
      category: "Allgemein",
        items: stored
    }]
  }
  else {
    // Read in the articles
    state.articles = await fetchAndProcessArticles();
  }

  state.filteredArticles = state.articles;

  fillArticlesTable();

  createArticlesIndex();
}

async function initializeBusinessConfigs() {
    const businesses = await fetchBusinessConfigs();
    
    globalStateHandler.addVar('businessConfigs', businesses);

    const retailBusiness = businesses.find(business => business.name === "Discounter");
    globalStateHandler.addVar('currBusinessConfig', retailBusiness)
}

export { initializeBusinessConfigs, switchToBusiness }
  
  