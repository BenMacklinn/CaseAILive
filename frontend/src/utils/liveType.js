/**
 * LiveType - A utility for displaying text with a typing effect
 * 
 * This module simulates a typing effect by displaying text word by word
 * with a configurable delay between words.
 */

/**
 * Displays text with a simulated typing effect
 * @param {string} text - The text to display
 * @param {HTMLElement} targetElem - The DOM element to update with the text
 * @returns {Promise<void>}
 */
export async function liveType(text, targetElem) {
  try {
    // Clear any existing text
    targetElem.innerText = '';
    
    // Split the text into words and punctuation
    const words = text.match(/[\w']+|[.,!?;:]/g) || [];
    let currentText = '';

    // Type each word with a delay
    for (const word of words) {
      // Add a space before the word if it's not punctuation
      if (!/^[.,!?;:]$/.test(word)) {
        currentText += (currentText ? ' ' : '') + word;
      } else {
        currentText += word;
      }
      
      // Update the display
      targetElem.innerText = currentText;
      
      // Add a delay between words (adjust timing as needed)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error('Error in liveType:', error);
    throw error;
  }
}

// Example usage:
/*
const demo = () => {
  const output = document.getElementById('output');
  const button = document.getElementById('start');
  
  button.onclick = async () => {
    button.disabled = true;
    try {
      await liveType('Tell me a short story', output);
    } catch (error) {
      output.innerText = 'Error: ' + error.message;
    }
    button.disabled = false;
  };
};
*/

// HTML demo:
/*
<!DOCTYPE html>
<html>
<head>
  <title>LiveType Demo</title>
  <style>
    #output {
      white-space: pre-wrap;
      font-family: monospace;
      padding: 20px;
      border: 1px solid #ccc;
      min-height: 100px;
    }
  </style>
</head>
<body>
  <button id="start">Start Demo</button>
  <div id="output"></div>
  <script type="module">
    import { liveType } from './liveType.js';
    window.demo = () => {
      const output = document.getElementById('output');
      const button = document.getElementById('start');
      
      button.onclick = async () => {
        button.disabled = true;
        try {
          await liveType('Tell me a short story', output);
        } catch (error) {
          output.innerText = 'Error: ' + error.message;
        }
        button.disabled = false;
      };
    };
    demo();
  </script>
</body>
</html>
*/ 