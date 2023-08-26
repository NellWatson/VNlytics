import geoip from "geoip-lite";
import mongoose from "mongoose";

// Load the models
import ProjectsData from "../models/projects.model.js";
import GameData, { addGameId, byId, updateChoiceData, updateGameFields, updateRelationshipData, updatePlayData } from "../models/game_data.model.js";

// Load helper function
import helper from "../utils/helper.js";
import CONSTANT from "../utils/constants.js";

export const checkIfPathValid = async(req, res, next) => {
    // Check if the Project ID is in the file.
    const gameExistsCount = await helper.documentExists(ProjectsData, {project_id: req.projectId});

    if ( gameExistsCount === 0 ) {
        return res.status(400).json({
            type: "failure",
            message: "The provided Project ID does not exist in our database."
        });
    };

    const id = req.url.split("/")[1];
    // If there isn't a game id provided, go to the next route.
    if (id == "") {
        next();
        return;
    };

    // Check if the provided game ID is valid or not;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a valid Game ID."
        });
    };

    // Make sure that the body is not empty.
    if (helper.isEmpty(req.body)) {
        return res.status(400).json({
            type: "failure",
            message: "Please send data to be updated with your request."
        });
    };

    next();
};

export const addNewGameId = async (req, res) => {
    const validatedObj = helper.validateBody(CONSTANT.gameDataInitFields, req.body, true);

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

    validatedObjproject_id = req.projectId;
    try {
        validatedObj.country = geoip.lookup(req.ip).country;
    } catch (err) {
        validatedObj.country = "local";
    };

    const data = await addGameId(validatedObj);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else {
        res.status(200).json(data);
    };
};

export const updateGameInstanceData = async (req, res) => {
    const validatedObj = helper.validateBody(CONSTANT.gameDataUpdatableFields, req.body);

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

    const increment = req.body.increment || false;
    const data = await updateGameFields(req.params._gameId, validatedObj, increment);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const deleteGameInstance = async (req, res) => {

};

export const getById = async (req, res) => {
    const data = await byId({ _id: req.params._gameId })

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
}

export const updateGameData = async (req, res) => {
    if (req.body.type === undefined || req.body.type === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a update type with your request."
        });
    };

    if (!CONSTANT.allowedUpdateMethods.includes(req.body.type)) {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a correct update type with your request."
        });
    }

    if (req.body.key === undefined || req.body.key === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a key for this update with your request."
        });
    };

    if (req.body.data === undefined || req.body.data === "" || req.body.data === {} || req.body.data === []) {
        return res.status(400).json({
            type: "failure",
            message: "Please provide data for this update with your request."
        });
    };

    var data = null;
    if (req.body.type === "relationship") {
        const increment = req.body.increment || false;
        data = await updateRelationshipData(req.params._gameId, req.body.key, req.body.data, increment);
    } else if (req.body.type === "choice") {
        data = await updateChoiceData(req.params._gameId, req.body.key, req.body.data);
    } else if (req.body.type === "play") {
        data = await updatePlayData(req.params._gameId, req.body.key, req.body.data);
    } else {
        res.status(400).json({
            type: "failure",
            message: "Please provide a valid type for this update with your request."
        });
    };

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};
