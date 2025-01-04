import { fillArticlesTable } from "./articles.js";
import { globalStateHandler, globalState as state } from "./globalState.js";
import modes from "./mode.js";
import { createMemoizedFunction, createRunLatestExecutor } from "./optimization.js";

function initializeSearch() {
    globalStateHandler
        .addVar('articlesIndex', [])
        .addVar('filteredArticles', []);
    
    createArticlesIndex();

    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', () => filterArticles(searchInput.value));

    if (!searchInput) return

    document.getElementById('clear-search').addEventListener('click', function() {
        const searchInput = document.getElementById('search-input')
        searchInput.value = '';
        filterArticles('')
    });
    
    // Focusing the search input field activates SEARCH mode
    searchInput.addEventListener('focus', () => {
        if (modes.currentMode.name !== 'SEARCH') {
            modes.retrieveMode('SEARCH').switchToMode()
        }
    });

    // Leaving the focus (blur) of the search input field activates NUMPAD mode
    searchInput.addEventListener('blur', () => {
        if (modes.currentMode.name === 'SEARCH') {
            modes.retrieveMode('NUMPAD').switchToMode()
        }
    });
}

/**
 * Creates the articlesIndex from the global articles list.
 * Each ID is formatted as a 4-digit number (with leading zeros).
 * The searchString includes the ID, category, name, and price.
 */
function createArticlesIndex() {
    state.articlesIndex = state.articles.flatMap((category) => 
        category.items.map((item) => {
            return {
                id: item.id,
                searchString: `${item.id} ${category.category} ${item.name} ${item.price}`.toLowerCase()
            };
        })
    );
}

function filterArticlesWorker(searchQuery) {
    if (!searchQuery.trim()) {
        // If the search field is empty, display all articles
        return state.articles;
    }

    // Extract search terms (words) and phrases (in quotation marks)
    const terms = [];
    const phraseRegex = /"([^"]+)"/g;
    let match;

    // Add phrases (words in quotation marks)
    while ((match = phraseRegex.exec(searchQuery)) !== null) {
        terms.push(match[1].toLowerCase());
    }

    // Remove the found phrases from the search string and split the rest
    const remainingQuery = searchQuery.replace(phraseRegex, '').trim();
    if (remainingQuery) {
        terms.push(...remainingQuery.split(/\s+/).map(term => term.toLowerCase()));
    }

    // Filter the article IDs that match all search terms
    const matchingIds = state.articlesIndex
        .filter(entry => terms.every(term => entry.searchString.includes(term)))
        .map(entry => entry.id);

    // Search for matching articles in the globally memoized (pre-filtered) articles list
    const filteredArticles = state.filteredArticles.map(category => ({
        category: category.category,
        items: category.items.filter(item => matchingIds.includes(item.id))
    })).filter(category => category.items.length > 0);

    return filteredArticles
}

const runLatest = createRunLatestExecutor();

// Create memoized function for filtering
let memoizedFilterArticles;
resetCache();

function resetCache() {
    memoizedFilterArticles = createMemoizedFunction(
        filterArticlesWorker, // Directly pass the worker function
        // Reset function: set state.filteredArticles to all articles
        () => {
            state.filteredArticles = state.articles;
        },
        // Pre-filter function: set state.filteredArticles to the result of memoized filtering
        (filteredArticles) => {
            state.filteredArticles = filteredArticles;
        }
    );
}

/**
 * Filters the articles based on the search field and updates the table.
 */
function filterArticles(searchQuery) {
  runLatest(async () => {
    // Use memoized filtering function
    state.filteredArticles = memoizedFilterArticles(searchQuery);
  
    // Use memoized HTML creation function
    fillArticlesTable(searchQuery);
  });
}

export { initializeSearch, createArticlesIndex, resetCache, filterArticles };
