import { State } from './state.js'; // Pfad ggf. anpassen

// Create the global state instance
const globalStateHandler = State.createState();
const globalState = globalStateHandler.getState()

export { globalStateHandler, globalState };