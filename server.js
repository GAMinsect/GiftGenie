import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

// 1. Resolve current directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Access and serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, "dist")));


// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie that can search the web! 

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading with the actual product's name
- Include a short explanation of why it works
- Include the current price or a price range
- Include one or more links to websites or social media business pages
where the gift can be bought

Prefer products that are widely available and well-reviewed.
If you can't find a working link or don't have access to the web, say so rather than guessing.
Each link should be displayed in the markdown format [link text](URL) and open in a new tab.

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section 
under each gift that guides the user to get the gift in that 
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.

Finish with a section with H2 heading titled "Wanna browse yourself?"
with links to various ecommerce sites with relevant search queries and filters 
already applied.`,
  },
];

// Challenge: See challenge.md for instructions
app.post("/api/gift", async (req, res) => {
  //console.log("Received request body:", req.body);
  // TODO: Step 2 — extract userPrompt from req.body and add to messages
  const { userPrompt, isWebSearchActive } = req.body

  messages.push({
    role: "user",
    content: userPrompt
  })
  

  try {
    let giftSuggestions = "";

    if (isWebSearchActive) {
      //console.log("Web search is active. Sending request to OpenAI Responses API with web search tool.");
      const response = await openai.responses.create({
        model: process.env.AI_MODEL,
        input: messages,
        tools: [{ type: "web_search_preview" }],
      });

      giftSuggestions = response.output_text;
      //console.log("Web search response:", giftSuggestions);
    }
    else{
      // TODO: Step 3 — send chat completions request
      const response = await openai.chat.completions.create({
        model: process.env.AI_MODEL,
        messages,
      });

      // TODO: Step 4 — extract content and send back as JSON
      giftSuggestions = response.choices[0].message.content
    }
    console.log(giftSuggestions)

    // Send the package back to the frontend
    res.json({ giftSuggestions });
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: `It's not you, it's us. 
    Something went wrong on the server` })
  }
});

// 4. Catch-all route to serve index.html for any frontend page request
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));