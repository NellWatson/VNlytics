// We need these modules to be present.
const express = require("express");
const dotEnv = require("dotenv");

// Initialise exress
const app = express();

// Initialise dotEnv;
dotEnv.config();

// Load environment variables
const PORT = process.env.PORT || 1313;

// When we respond with a json object, indent every block with 4 spaces.
app.set("json spaces", 4);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Where should we look for the static files
app.use(express.static(__dirname + "/public"));

// Custom Error handling
app.use(function(req, res) {
   res.status(404).send({
      type: "error",
      message: "404: Page not Found"});
});

app.use(function(error, req, res, next) {
   res.status(500).send({
      type: "error",
      message: "500: Internal Server Error"});
});

// Start the server
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT} ${process.env.NODE_ENV}`);
});
