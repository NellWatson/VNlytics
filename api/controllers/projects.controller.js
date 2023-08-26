// Load the models
import { addProject, byId, countTotalProjects, deleteData, getData, updateData } from "../models/projects.model.js";
import { aggregateData } from "../models/game_data.model.js";

// Load helper function
import helper from "../utils/helper.js";

// Load constants
import CONSTANT from "../utils/constants.js";

export const invalidProjectId = (req, res) => {
    res.status(400).json({
        type: "failure",
        message: "Please provide a valid Project ID."
    });
};

export const createNewProject = async (req, res) => {
    const validatedObj = helper.validateBody(CONSTANT.projectDataInitFields, req.body, true);

    if ("extra" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Extra data is provided with the request: ${validatedObj.extra}`
        });
    };

    if ("error" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Following keys have invalid value types: ${validatedObj.error}`
        });
    };

    if ("missing" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Following keys are missing from the request: ${validatedObj.missing}`
        });
    };

    if (req.header("Create-Project-Auth") != process.env.CREATE_NEW_PROJECT_KEY) {
        return res.status(400).json({
            type: "failure",
            message: "Contact admin for the correct auth key."
        });
    };
    
    const data = await addProject(validatedObj);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else {
        res.status(200).json(data);
    };
};

export const updateProject = async (req, res) => {
    const query = {
        _id: req.body.id,
        project_id: req.params._projectId
    };
    delete req.body.id;
    const validatedObj = helper.validateBody(CONSTANT.projectUpdatableFields, req.body);

    if (query._id === null || query._id === undefined) {
        return res.status(400).json({
            type: "failure",
            message: "Please provide ID of the project."
        });
    };

    if (helper.isEmpty(validatedObj)) {
        return res.status(400).json({
            type: "failure",
            message: "Please send data to be updated with your request."
        });
    };

    if ("error" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Follwing keys have invalid value types: ${validatedObj.error}.`
        });
    };

    const data = await updateData(query, validatedObj);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const deleteAllProjects = async (req, res) => {
    if (process.env.NODE_ENV != "test") {
        return res.status(400).json({
            type: "failure",
            message: "Projects can only be deleted in test environment."
        })
    };

    if (req.header("Delete-Project-Auth") != process.env.DELETE_PROJECT_KEY) {
        return res.status(400).json({
            type: "failure",
            message: "Contact admin for the correct auth key."
        });
    };

    const data = await deleteData();

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
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

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const getAllPlatformCount = async (req, res) => {
    const query = { project_id: req.params._projectId };
    const field = "platform";
    
    req.query = helper.sanitise(req.query);

    if ( "unique" in req.query ) {
        query.multiple_ids = false;
    };
    
    if ( "resolution" in req.query ) {
        if ( req.query.resolution === "full hd" ) {
            query.display_size = "(1920, 1080)";
        } else if ( req.query.resolution === "hd" ) {
            query.display_size = "(1280, 720)";
        } else {
            query.display_size = req.query.resolution;
        }
    };

    aggregateData( field, query, function(err, doc) {
        res.send(doc);
    })
}
