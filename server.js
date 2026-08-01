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

// 3. Your API routes
app.post("/api/gift", async (req, res) => {
  // ... your OpenAI logic
});

// 4. Catch-all route to serve index.html for any frontend page request
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));