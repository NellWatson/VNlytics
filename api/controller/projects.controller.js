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

export const updateProject = async (req, res) => {
    const projectId = req.params._projectId;
    const updatedObj = helper.validatePost( CONSTANT.projectUpdatableFields, req.body );

    if (req.header("Create-Project-Auth") != process.env.CREATE_NEW_PROJECT_KEY) {
        res.status(400).json({
            type: "failure",
            message: "Contact admin for the correct auth key."
        });
    };

    if (helper.isEmpty(updatedObj)) {
        res.status(400).json({
            type: "failure",
            message: "Please send data to be updated with your request."
        });
    };

    const data = await updateData(projectId, updatedObj);

    if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const deleteAllProjects = async (req, res) => {
    if (process.env.NODE_ENV != "test") {
        res.status(400).json({
            type: "failure",
            message: "Projects can only be deleted in test environment."
        })
    };

    if (req.header("Delete-Project-Auth") != process.env.DELETE_PROJECT_KEY) {
        res.status(400).json({
            type: "failure",
            message: "Contact admin for the correct auth key."
        });
    };

    const data = await deleteData();

    if (data.type === "failure") {
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

    if (data.type === "failure") {
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
