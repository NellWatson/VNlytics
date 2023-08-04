// Load modules
import { Router } from "express";

// Load additional route file
import gameData from "./game_data.route.js";
import projects from "./projects.route.js";

// Load controller
import { countAllProjects, createNewProject, getAllProjects } from "../../controller/projects.controller.js";

// Initialise the router
const v1 = Router();

v1.use("/:_projectId", (req, res, next) => {
    // Store the value of project id
    req._projectId = req.params._projectId;
    next();
});

v1.get("/total_projects", countAllProjects);

v1.get("/project", getAllProjects);

v1.post("/create", createNewProject);

//Load the projects module
v1.use("/", projects);

//Load the gameData module
v1.use("/:_projectId", gameData);

v1.get("/", (req, res) => {
    res.send("Please provide a valid Project ID.");
});

export default v1;
