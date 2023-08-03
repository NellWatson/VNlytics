// Load modules
import { Router } from "express";

// Initialise the router
const v1 = Router();

// Load the models
import { addProject, getData, countTotalProjects } from "../../models/projects.js";

v1.use("/:_projectId", (req, res, next) => {
    // Store the value of project id
    req._projectId = req.params._projectId;
    next();
});

v1.get("/total_projects", async (req, res) => {
    const data = await countTotalProjects();
    res.status(200).json(data);
});

v1.get("/project", async (req, res) => {
    const data = await getData({});

    res.status(200).json(data);
});

v1.post("/create", async (req, res) => {
    const project = req.body;

    if (req.header("Create-Project-Auth") != process.env.CREATE_NEW_PROJECT_KEY) {
        res.status(400).json({
            type: "failure",
            message: "Contact admin for the correct auth key."
        });
    };
    
    const data = await addProject(project);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else {
        res.status(200).json(data);
    };
});

//Load the projects module
// v1.use("/", import("./projects"));

// //Load the game.data module
// v1.use("/:_projectId", import("./game.data"));

v1.get("/", (req, res) => {
    res.send("Please provide a valid Project ID.");
});

export default v1;
