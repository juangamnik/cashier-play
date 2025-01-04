import { globalState as state } from "./globalState.js";
import modes from './mode.js';

function initializeNumpad() {
    document.querySelectorAll('.numpad button').forEach(button => {
        button.addEventListener('click', () => {
            modes.currentMode.handleInput(button.textContent)
        });
    });
    
    document.addEventListener('keydown', (e) => {
        const mode = modes.currentMode;
        if (!mode || !mode.relevantKeys || !mode.handleInput) return;
    
        if (mode.relevantKeys(e.key)) {
            e.preventDefault();
            mode.handleInput(e.key);
        }
    });

    // Initialize the numpad display.
    updateDisplay()
}

// Function to update the display field.
function updateDisplay() {
    const displayElement = document.getElementById('numpad-display');
    displayElement.textContent = `${state.quantity} x ${state.currentInput}`;
}

// Function to clear the display field.
function clearInput() {
    state.quantity = 1;
    state.currentInput = '';
}

export { initializeNumpad, updateDisplay, clearInput };