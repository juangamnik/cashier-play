if (!crypto.randomUUID) {
  crypto.randomUUID = function () {
      function randomDigit() {
          return Math.floor(Math.random() * 16).toString(16);
      }

      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = randomDigit();
          return c === 'x' ? r : (parseInt(r) & 0x3 | 0x8).toString(16);
      });
  };
}

export function createMemoizedFunction(fn, reset = null, preFilter = null) {
    const memo = new Map(); // Map of input string -> output
    let sortedKeys = [];    // Cached sorted list of keys
  
    return function memoized(input) {
      const inputStr = String(input).toLowerCase();
  
      // Case 1: Input has already been seen
      if (memo.has(inputStr)) {
        return memo.get(inputStr);
      }
  
      // Case 2 & 3: Input has not been seen
      if (reset && preFilter) {
        const prefix = binarySearchForLargestPrefix(sortedKeys, inputStr);
  
        if (prefix) {
          // Case 2: A prefix is found, use preFilter
          preFilter(memo.get(prefix));
        } else {
          // Case 3: No prefix is found, use reset
          reset();
        }
      }
  
      // Call the inner function
      const result = fn(input);
  
      // Update memoization with the new input and result
      memo.set(inputStr, result);
  
      // Update the sorted keys
      sortedKeys = [...memo.keys()].sort();
  
      return result;
    };
}
  
function binarySearchForLargestPrefix(keys, input, left = 0, right = keys.length - 1, candidate = null) {
  while (left <= right) {
      const mid = (left + right) >>> 1;
      const key = keys[mid];

      if (input.startsWith(key)) {
          // Update the candidate if it is longer
          candidate = candidate === null || key.length > candidate.length ? key : candidate;
          // Continue searching to the right to find longer prefixes
          left = mid + 1;
      } else if (key < input) {
          // Continue searching to the right
          left = mid + 1;
      } else {
          // Continue searching to the left
          right = mid - 1;
      }
  }
  return candidate;
}

/**
 * Returns a function that queues async function calls.
 * Only the latest queued call will run after the currently running call finishes.
 * Older queued calls become obsolete and won't run.
 */
export function createRunLatestExecutor() {
    let lastPromise = Promise.resolve();  // Promise that resolves when the last call finished
    let currentFuncUUID = null;           // UUID of the currently latest queued function

    return (func) => {
        const myUUID = crypto.randomUUID();    // Unique ID for this call
        currentFuncUUID = myUUID;         // Mark this call as the latest

        // Queue up after the last call
        const newPromise = lastPromise.then(() => {
            // Only run if still the latest
            if (myUUID === currentFuncUUID) {
                return func();
            }
            // If not latest, skip execution
            return Promise.resolve();
        });

        // Update lastPromise chain
        lastPromise = newPromise.catch((err) => {
            console.error("Error in queued function call:", err);
            // Continue the chain despite errors
        });

        return newPromise;
    };
}