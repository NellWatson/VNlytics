// We need these modules to be present.
import path from "path";
import dotEnv from "dotenv";
import express from "express";
import { fileURLToPath } from 'url';
import connectToDatabase from "./database.js";
import morganMiddleware from "./middlewares/morgan.middleware.js";

import router from "./routes/index.route.js";

// Initialise express
const app = express();

// Initialise dotEnv;
dotEnv.config();

// Define file and directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const PORT = process.env.PORT || 1313;

// Properly parse the json and urlencoed data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Add the morgan middleware
app.use(morganMiddleware);

// When we respond with a json object, indent every block with 4 spaces.
app.set("json spaces", 4);

// Where should we look for the static files
app.use(express.static(path.join(__dirname, "../public")));

//Load the different routes
app.use(router);

// Connect to database
connectToDatabase();

// Custom Error handling
app.use((req, res) => {
   res.status(404).json({
      type: "error",
      message: "404: Page not Found"});
});

app.use((error, req, res, next) => {
   if (error.name === "SyntaxError" && error.status === 400 && error.type === "entity.parse.failed") {
      return res.status(403).json({
         type: "error",
         message: "The JSON request is malformed."
      })
   };

   res.status(500).json({
      type: "error",
      message: "500: Internal Server Error"});
});

// Start the server
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

// Export for test
export default app;
