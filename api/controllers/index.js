// Loading the modules
import { Router } from "express";
import v1 from "./v1/index.js";

const router = Router();

// Load the models
import { addProject } from "../models/projects.js";

// Test intialisation of Founders Life Project.
router.get("/create/new/project/founder_life/mvp/setup", async (req, res) => {

    // This is the default project.
    const project = {
        "project_id": "FoundersLifeAlpha",
        "title": "Founders Life",
        "developer": "Nell Watson",
        "engine": "Ren'Py"
    };
    
    const data = await addProject(project);

    if ("type" in data) {
        if (data.type === "error") {
            res.status(500).json(data);
        }
    } else {
        res.status(200).json({
            type: "success",
            data: data
        });
    };
});

// Test intialisation
router.get("/create/new/project/test/first_run/", async (req, res) => {

    // This is the default project.
    const project = {
        "project_id": "TestGame",
        "title": "Telemetry Test",
        "developer": "Nell Watson",
        "engine": "Ren'Py"
    };
    
    const data = await addProject(project);

    if ("type" in data) {
        if (data.type === "error") {
            res.status(500).json(data);
        }
    } else {
        res.status(200).json({
            type: "success",
            data: data
        });
    };
});

router.post("/", (req, res) => {
    res.send("Cool. We are working. Now you can proceed to cry.");
});

// Load all the available API routes
router.use("/v1", v1);

export default router;
