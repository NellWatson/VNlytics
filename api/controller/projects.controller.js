// Load the models
import { addProject, byId, getData, countTotalProjects } from "../models/projects.model.js";

export const invalidProjectId = (req, res) => {
    res.status(400).json({
        type: "failure",
        message: "Please provide a valid Project ID."
    });
};

export const countAllProjects = async (req, res) => {
    const data = await countTotalProjects();
    res.status(200).json(data);
};

export const getAllProjects = async (req, res) => {
    const data = await getData({});
    res.status(200).json(data);
};

export const getOneProject = async (req, res) => {
    const _projectId = req.params._projectId;
    const data = await byId( { project_id: _projectId });

    if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const createNewProject = async (req, res) => {
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
};
