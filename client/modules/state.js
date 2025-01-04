export const State = (() => {
    return {
        createState() {
            const _state = {};
            const _listeners = {};

            const stateProxy = new Proxy(_state, {
                get(target, prop) {
                    if (prop in target) {
                        return target[prop];
                    } else if (typeof prop === 'string' && prop in _state) {
                        return _state[prop];
                    }
                    return target[prop];
                },
                set(target, prop, value) {
                    if (prop in _state) {
                        target[prop] = value;
                        if (_listeners[prop]) {
                            _listeners[prop].forEach(callback => callback(value));
                        }
                        return true;
                    } else {
                        console.error(`State key "${prop}" does not exist. Use addVar() first.`);
                        return false;
                    }
                }
            });

            return {
                /**
                 * Adds a new state variable
                 * @param {string} key - Name of the state variable
                 * @param {*} initialValue - The initial value of the variable
                 * @param {function} [listener] - Optional callback invoked on changes
                 * @returns {this} - Enables method chaining
                 */
                addVar(key, initialValue = null, listener = null) {
                    if (!(key in _state)) {
                        _state[key] = initialValue;
                        if (listener && typeof listener === 'function') {
                            this.onChange(key, listener);
                        }
                    } else {
                        console.warn(`State key "${key}" exists already.`);
                    }
                    return this;
                },

                /**
                 * Reacts to changes of a specific state variable
                 * @param {string} key - Name of the state variable
                 * @param {function} callback - Function invoked on changes
                 * @returns {this} - Enables method chaining
                 */
                onChange(key, callback) {
                    if (!_listeners[key]) {
                        _listeners[key] = [];
                    }
                    _listeners[key].push(callback);
                    return this;
                },

                /**
                 * Returns the underlying proxy object
                 * @returns {object} - The proxy object accessible via dot notation
                 */
                getState() {
                    return stateProxy;
                }
            };
        }
    };
})();