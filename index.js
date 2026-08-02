import { marked } from "marked";
import DOMPurify from "dompurify";
import { autoResizeTextarea, setLoading } from "./utils.js";

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");
const webSearchBtn = document.getElementById("web-search-icon");

let isWebSearchActive = false

// To remove citations like 【5†L21-L23】 or 【4†source】 from the text
function removeCitations(text) {
  
  return text.replace(/【\d+†[^】]+】/g, "");
}

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);

  webSearchBtn.addEventListener("click", () => {
    isWebSearchActive = !isWebSearchActive;
    console.log("Web search active:", isWebSearchActive);
    webSearchBtn.classList.toggle("active", isWebSearchActive);
  });
}

async function handleGiftRequest(e) {
  // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  // Set loading state (hides output, animates lamp)
  setLoading(true);

  try {
    
    // TODO: Step 1 — send fetch request to /api/gift
    console.log(userPrompt)
    const response = await fetch("/api/gift",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userPrompt,
        isWebSearchActive
      })
    })
    
    // TODO: Step 5 — parse response and extract giftSuggestions
    const giftSuggestions = (await response.json()).giftSuggestions;

    // Convert Markdown to HTML p 
    const html = marked.parse(giftSuggestions);

    // Remove citations from the generated HTML
    const cleanedHTML = removeCitations(html);

    // Sanitize the HTML to prevent XSS attacks
    const safeHTML = DOMPurify.sanitize(cleanedHTML);

    // Render the result
    outputContent.innerHTML = safeHTML;
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Display friendly error message
    outputContent.textContent =
      "Sorry, I can't access what I need right now. Please try again in a bit.";
  } finally {
    // Always clear loading state (shows output, resets lamp)
    setLoading(false);
  }
}

start();
