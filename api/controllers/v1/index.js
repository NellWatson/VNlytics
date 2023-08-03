// Load modules
import { Router } from "express";

const v1 = Router();

// Load the models
import ProjectsData, { getData, addProject } from "../../models/projects.js";

v1.use("/:_projectId", (req, res, next) => {
    // Store the value of project id
    req._projectId = req.params._projectId;
    next();
});

v1.get("/stats", async (req, res) => {
    try {
        const data = await ProjectsData.estimatedDocumentCount();

        res.status(200).json({
            type: "success",
            message: data + " Project(s) is registered with the site.",
            data: data
        })
    } catch (err){
        logger.error(err);
    };
});

v1.get("/project", async (req, res) => {
    const data = await getData({}, 100);

    res.status(200).json({
        type: "success",
        data: data
    });
});

v1.post("/create", async (req, res) => {
    const project = req.body;
    
    const data = await addProject(project)

    res.status(200).json({
        type: "success",
        data: data
    });
});

//Load the projects module
// v1.use("/", import("./projects"));

// //Load the game.data module
// v1.use("/:_projectId", import("./game.data"));

v1.get("/", (req, res) => {
    res.send("Please provide a valid Project ID.");
});

export default v1;
