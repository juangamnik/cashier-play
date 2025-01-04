import modes from './modules/mode.js';
import { globalStateHandler, globalState as state } from './modules/globalState.js';
import { loadHeader } from './modules/header.js';
import { fetchAndProcessArticles, fillArticlesTable } from './modules/articles.js';
import { initializeSearch } from './modules/search.js';
import { addArticleToReceipt, finalizeReceipt, clearReceipt, finalized } from './modules/receipt.js';
import { updateDisplay, clearInput, initializeNumpad } from './modules/numpad.js';
import { animateButtonPress, showErrorBorder } from './modules/animations.js'
import { initializeMenu, populateMenu } from './modules/menu.js';
import { initializeBusinessConfigs } from './modules/business.js';
import { printReceipt } from './modules/print.js';

// Define the NUMPAD-Mode
modes.addMode('NUMPAD')
    .addConfig('relevantKeys', (key) => 
        !isNaN(key) || 
        key === 'Enter' || 
        key === 'Backspace' ||
        key === 'Tab' ||
        ['x', '*', 's', 'm', 'd'].includes(key.toLowerCase())
    )
    .addConfig('handleInput', (input) => {
        if (!isNaN(input)) {
            state.currentInput += input;
            animateButtonPress(input);
        } 
        else if (input.toLowerCase() === 'x' || input === '*') {
            state.quantity = parseInt(state.currentInput) || 1;
            state.currentInput = '';
            animateButtonPress('x');
        } 
        else if (input.toLowerCase() === 's' || input === 'Tab') {
            modes.retrieveMode('SEARCH').switchToMode()
        }
        else if (input.toLowerCase() === 'm') {
            modes.retrieveMode('MENU').switchToMode()
        }
        else if (input === 'Backspace' || input === '\u232B') {
            clearInput();
        }
        else if (input.toLowerCase() === 'd') {
            printReceipt()
        }
        else if (input === 'Enter' || input === '\u23CE') {
            animateButtonPress('Enter');
            if (!state.currentInput) {
                !finalized ? finalizeReceipt() : clearReceipt();
                return;
            }

            // Removes leading zeros until the length is at least 4 characters
            const sanitizedInput = state.currentInput.replace(/^0+/, '').padStart(4, '0');

            const article = state.articles
                .map(group => group.items)
                .flat()
                .find(a => a.id === sanitizedInput);

            if (article) {
                addArticleToReceipt(article, state.quantity);
            } else {
                showErrorBorder();
            }

            state.currentInput = '';
            state.quantity = 1;
        }
    })
    .addConfig('switchToMode', () => {
        const numpadElement = document.getElementById('numpad');
        if (numpadElement) {
            numpadElement.classList.add('focus');
        }
    })
    .addConfig('switchFromMode', () => {
        const numpadElement = document.getElementById('numpad');
        if (numpadElement) {
            numpadElement.classList.remove('focus');
        }
    })
    .getConfig().switchToMode();

// Define the SEARCH-Mode
modes.addMode('SEARCH')
     .addConfig('relevantKeys', (key) => 
        key === 'Escape' ||
        key === 'Tab'
    )
     .addConfig('handleInput', (input) => {
         if (input === 'Escape' || input === 'Tab') {
            modes.retrieveMode('NUMPAD').switchToMode()
         }
     })
     .addConfig('switchToMode', () => {
        const searchInput = document.getElementById('search-input');
        if (searchInput && document.activeElement !== searchInput) {
            searchInput.focus();
        }
    })
    .addConfig('switchFromMode', () => {
        const searchInput = document.getElementById('search-input');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.blur();
        }
    })

modes.addMode('MENU')
    .addConfig('relevantKeys', (key) =>
        key === 'Tab' ||
        key === 'Escape' ||
        key.toLowerCase() === 's'
    )
    .addConfig('handleInput', (input) => {
        if(input === 'Tab' || input === 'Escape') {
            modes.retrieveMode('NUMPAD').switchToMode()
        }
        else if(input.toLowerCase() === 's') {
            modes.retrieveMode('SEARCH').switchToMode()
        }
    })
    .addConfig('switchToMode', () => {
        const burgerMenuButton = document.getElementById('burger-menu-button');
        const burgerMenuList = document.getElementById('burger-menu-list');
        burgerMenuButton.classList.add('active');
        burgerMenuList.classList.add('active');
    })
    .addConfig('switchFromMode', () => {
        const burgerMenuButton = document.getElementById('burger-menu-button');
        const burgerMenuList = document.getElementById('burger-menu-list');
        burgerMenuList.classList.remove('active');
        burgerMenuButton.classList.remove('active');
    })

// Define the global state
globalStateHandler
    .addVar('quantity', 1)
    .onChange('quantity', newValue => {
        console.log(`quantity changed to: ${newValue}`)
        updateDisplay()
    })
    .addVar('currentInput', '')
    .onChange('currentInput',newValue => {
        console.log(`currentInput changed to: ${newValue}`)
        updateDisplay()
    })
    .addVar('articles', [])


await initializeBusinessConfigs();

loadHeader();

initializeNumpad();

initializeMenu();

populateMenu();

state.articles = await fetchAndProcessArticles();

fillArticlesTable();

initializeSearch();