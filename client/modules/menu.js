import { switchToBusiness } from "./business.js";
import { globalState as state } from "./globalState.js";
import modes from "./mode.js";

function initializeMenu() {
    const burgerMenuButton = document.getElementById('burger-menu-button');
    const burgerMenuList = document.getElementById('burger-menu-list');

    // Open and close the menu when the burger button is clicked
    burgerMenuButton.addEventListener('click', () => {
        modes.retrieveMode('MENU').switchToMode();
    });

    // Close the menu when a menu item is clicked and log a message to the console
    burgerMenuList.addEventListener('click', (event) => {
        if (event.target.classList.contains('burger-menu-item')) {
            const path = event.target.getAttribute('data-action');
            switchToBusiness(path)
            modes.retrieveMode('NUMPAD').switchToMode();
        }
    });

    // Close the menu when clicking outside of the menu
    document.addEventListener('click', (event) => {
        // Check if the clicked element is NOT the burger menu or the burger button
        if (!burgerMenuList.contains(event.target) && !burgerMenuButton.contains(event.target) && modes.currentMode.name === 'MENU') {
            modes.retrieveMode('NUMPAD').switchToMode();
        }
    });
}

function populateMenu() {
    // Find the list in the DOM
    const burgerMenuList = document.getElementById('burger-menu-list');

    // Ensure the list exists
    if (!burgerMenuList) {
        console.error("Burger-Menü-Liste nicht gefunden.");
        return;
    }

    // Remove the "Loading..." item
    burgerMenuList.innerHTML = '';

    // Create a list item for each business config
    state.businessConfigs.forEach(config => {
        const listItem = document.createElement('li');
        listItem.className = 'burger-menu-item';
        listItem.dataset.action = config.path; 
        listItem.textContent = config.name; 
        burgerMenuList.appendChild(listItem); 
    });
}

export { initializeMenu, populateMenu }
