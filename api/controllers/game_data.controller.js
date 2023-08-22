import geoip from "geoip-lite";
import mongoose from "mongoose";

// Load the models
import ProjectsData from "../models/projects.model.js";
import GameData, { addGameId, byId, updateChoiceData, updateRelationshipData, updatePlayData } from "../models/game_data.model.js";

// Load helper function
import helper from "../utils/helper.js";
import constants from "../utils/constants.js";

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
    req.body.project_id = req.projectId;
    try {
        req.body.country = geoip.lookup(req.ip).country;
    } catch (err) {
        req.body.country = "local";
    };

    const data = await addGameId(req.body);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else {
        res.status(200).json(data);
    };
};

export const updateGameInstanceData = async (req, res) => {
    
};

export const deleteGameInstance = async (req, res) => {

};

export const getById = async (req, res) => {
    const data = await byId( { _id: req.params._gameId })

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
}

export const updateData = async (req, res) => {
    if (req.body.type === undefined || req.body.type === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a update type with your request."
        });
    };

    if (!constants.allowedUpdateMethods.includes(req.body.type)) {
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
        data = await updateRelationshipData(req.params._gameId, req.body.key, req.body.data);
    } else if (req.body.type === "choice") {
        data = await updateChoiceData(req.params._gameId, req.body.key, req.body.data);
    } else if (req.body.type === "play") {
        data = await updatePlayData(req.params._gameId, req.body.key, req.body.data);
    };

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};
