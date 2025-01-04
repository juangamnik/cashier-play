/**
 * Mode Library
 */
class Mode {
    constructor(name) {
        this.name = name;
        this.config = { 
            name: this.name,
            // Default implementation.
            switchToMode: () => {
                const switchFromCurrMode = modes.currentMode?.switchFromMode
                modes.setCurrentMode(this.name) 
                if(switchFromCurrMode) switchFromCurrMode()
            }
        };
    }

    /**
     * Adds a new configuration option to this mode.
     * @param {string} key - The name of the configuration (e.g., "relevantKeys", "handleInput")
     * @param {function|any} value - The function or value to assign
     * @returns {this} - Returns the current mode object (for chaining)
     */
    addConfig(key, value) {
        if (key === 'switchToMode' && typeof value === 'function') {
            // Combine custom implementation with the default implementation
            const defaultSwitchToMode = this.config.switchToMode;
            this.config[key] = (...args) => {
                defaultSwitchToMode(...args); // Execute the default function (sets the current mode)
                value(...args); // Execute the custom function
            };
        } else {
            this.config[key] = value;
        }
        return this; // Enables chaining
    }

    /**
     * Returns the entire configuration for this mode.
     * @returns {object} - The mode's configuration
     */
    getConfig() {
        return this.config;
    }

    /**
     * Retrieves a specific configuration property.
     * @param {string} key - The name of the configuration (e.g., "relevantKeys", "handleInput")
     * @returns {any} - The value of the configuration
     */
    getConfigProperty(key) {
        return this.config[key];
    }
}

const modes = (() => {
    const modes = {};
    let _currentMode = null; // Private member for the current mode

    return {
        /**
         * Creates a new mode or retrieves an existing mode.
         * @param {string} modeName - The name of the mode
         * @returns {Mode} - Returns the instance of the mode
         */
        addMode: (modeName) => {
            if (!modes[modeName]) {
                modes[modeName] = new Mode(modeName);
            }
            return modes[modeName];
        },

        /**
         * Retrieves the entire configuration for a specific mode.
         * @param {string} modeName - The name of the mode
         * @returns {object} - The entire configuration of the mode
         */
        retrieveMode: (modeName) => modes[modeName]?.getConfig() || {},

        /**
         * Access the current mode using dot notation.
         * @returns {object|null} - The configuration of the current mode, or null if no mode is set
         */
        get currentMode() {
            return _currentMode ? _currentMode.getConfig() : {};
        },

        /**
         * Sets the current mode.
         * @param {string} modeName - The name of the mode to set as current
         */
        setCurrentMode: (modeName) => {
            _currentMode = modes[modeName] || null;
        }
    };
})();

export default modes;