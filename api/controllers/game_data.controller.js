import geoip from "geoip-lite";
import mongoose from "mongoose";

// Load the models
import ProjectsData from "../models/projects.model.js";
import { addGameId, byId, deleteData, endGame, replaceChoiceData, replacePlayData, replaceRelationshipData, updateChoiceData, updateGameFields, updateRelationshipData, updatePlayData } from "../models/game_data.model.js";

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

    if (req.method == "DELETE") {
        next();
        return;
    };

    // Make sure that the body is not empty.
    if (req.method != "GET" && helper.isEmpty(req.body)) {
        return res.status(400).json({
            type: "failure",
            message: "Please send data to be updated with your request."
        });
    };

    next();
};

export const addNewGameId = async (req, res) => {
    const validatedObj = helper.validateBody(CONSTANT.gameDataInitFields, req.body);

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

    validatedObj.project_id = req.projectId;
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
    const data = await deleteData(req.params._gameId);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
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
};

export const updateGameDataBatch = async (req, res) => {
    if (req.body === undefined || !Array.isArray(req.body)) {
        return res.status(400).json({
            type: "failure",
            message: "Invalid batch data."
        });
    };

    if (!req.body.every(i => typeof i === "object")) {
        return res.status(400).json({
            type: "failure",
            message: "Invalid batch data."
        });
    };

    const results = {};
    
    for (const i in req.body) {
        const body = req.body[i];

        if (!["put", "patch"].includes(body.method)) {
            results[body.path] = {
                type: "failure",
                message: "Unsupported method type."
            };
            continue;
        };

        if (body.path === "/") {
            const validatedObj = helper.validateBody(CONSTANT.gameDataUpdatableFields, body.data);
        
            if ("extra" in validatedObj) {
                results[body.path] = {
                    type: "failure",
                    message: `Extra data is provided with the request: ${validatedObj.extra}`
                };
                continue;
            };
        
            if ("error" in validatedObj) {
                results[body.path] = {
                    type: "failure",
                    message: `Following keys have invalid value types: ${validatedObj.error}`
                };
                continue;
            };
        
            const increment = body.increment || false;
            results[body.path] = await updateGameFields(req.params._gameId, validatedObj, increment);

        } else if (body.path === "/relationship") {
            if (body.method === "patch") {
                if (body.key === undefined || body.key === "") {
                    results[body.path] = {
                        type: "failure",
                        message: "Please provide a key for this update with your request."
                    };
                    continue;
                };
            
                if (body.data === undefined || body.data === "") {
                    results[body.path] = {
                        type: "failure",
                        message: "Please provide data for this update with your request."
                    };
                    continue;
                };
            
                const increment = body.increment || false;
                results[body.path] = await updateRelationshipData(req.params._gameId, body.key, body.data, increment);

            } else if (body.method === "put") {
                if (body.key != undefined) {
                    results[body.path] = {
                        type: "failure",
                        message: "Please don't provide `key` property with a PUT request."
                    };
                    continue;
                };
                
                results[body.path] = await replaceChoiceData(req.params._gameId, body.data);
            };

        } else if (body.path === "/choice") {
            if (body.method === "patch") {
                if (body.key === undefined || body.key === "") {
                    results[body.path] = {
                        type: "failure",
                        message: "Please provide a key for this update with your request."
                    };
                    continue;
                };
            
                if (body.data === undefined || body.data === "") {
                    results[body.path] = {
                        type: "failure",
                        message: "Please provide data for this update with your request."
                    };
                    continue;
                };
            
                results[body.path] = await updateChoiceData(req.params._gameId, body.key, body.data);

            } else if (body.method === "put") {
                if (body.key != undefined) {
                    results[body.path] = {
                        type: "failure",
                        message: "Please don't provide `key` property with a PUT request."
                    };
                    continue;
                };

                results[body.path] = await replaceChoiceData(req.params._gameId, body.data);
            };

        } else if (body.path === "/play") {
            if (body.method === "patch") {
                if (body.key === undefined || body.key === "") {
                    results[body.path] = {
                        type: "failure",
                        message: "Please provide a key for this update with your request."
                    };
                    continue;
                };
            
                if (body.data === undefined || body.data === "") {
                    results[body.path] = {
                        type: "failure",
                        message: "Please provide data for this update with your request."
                    };
                    continue;
                };
            
                results[body.path] = await updatePlayData(req.params._gameId, body.key, body.data);

            } else if (body.method === "put") {
                if (body.key != undefined) {
                    results[body.path] = {
                        type: "failure",
                        message: "Please don't provide `key` property with a PUT request."
                    };
                    continue;
                };
                
                results[body.path] = await replacePlayData(req.params._gameId, body.data);
            };

        } else if (body.path != undefined) {
            results[body.path] = {
                type: "failure",
                message: "This type isn't supported for batch processing."
            };
        } else {
            results["_missing"] = {
                type: "failure",
                message: "Path property needs to be provided with each request."
            }
        };

        if (body.path != undefined && results[body.path].data != undefined && results[body.path].data._id != undefined) {
            req.params._gameId = results[body.path].data._id;
            results._id = results[body.path].data._id;
        };
    };

    if (Object.values(results).every(item => item.type === "success")) {
        res.status(200).json(results);

    } else if (Object.values(results).every(item => item.type === "failure")) {
        res.status(400).json(results);

    } else if (Object.values(results).every(item => item.type === "error")) {
        res.status(500).json(results);

    } else {
        res.status(210).json(results);
    };
};

export const replaceGameRelationshipData = async (req, res) => {
    const data = await replaceRelationshipData(req.params._gameId, req.body);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const replaceGameChoiceData = async (req, res) => {
    const data = await replaceChoiceData(req.params._gameId, req.body);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const replaceGamePlayData = async (req, res) => {
    const data = await replacePlayData(req.params._gameId, req.body);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const updateGameRelationshipData = async (req, res) => {
    if (req.body.key === undefined || req.body.key === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a key for this update with your request."
        });
    };

    if (req.body.data === undefined || req.body.data === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide data for this update with your request."
        });
    };

    const increment = req.body.increment || false;
    const data = await updateRelationshipData(req.params._gameId, req.body.key, req.body.data, increment);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const updateGameChoiceData = async (req, res) => {
    if (req.body.key === undefined || req.body.key === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a key for this update with your request."
        });
    };

    if (req.body.data === undefined || req.body.data === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide data for this update with your request."
        });
    };

    const data = await updateChoiceData(req.params._gameId, req.body.key, req.body.data);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const updateGamePlayData = async (req, res) => {
    if (req.body.key === undefined || req.body.key === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a key for this update with your request."
        });
    };

    if (req.body.data === undefined || req.body.data === "") {
        return res.status(400).json({
            type: "failure",
            message: "Please provide data for this update with your request."
        });
    };

    const data = await updatePlayData(req.params._gameId, req.body.key, req.body.data);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};

export const endGameData = async (req, res) => {
    const validatedObj = helper.validateBody(CONSTANT.endGameDataFields, req.body);

    if ("extra" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Extra data is provided with the request: ${validatedObj.extra}`
        });
    };

    if ("missing" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Required keys are missing from the request: ${validatedObj.missing}`
        });
    };

    if ("error" in validatedObj) {
        return res.status(400).json({
            type: "failure",
            message: `Following keys have invalid value types: ${validatedObj.error}`
        });
    };

    validatedObj.end_date = new Date().toISOString();

    const increment = req.body.increment || false;
    const data = await endGame(req.params._gameId, validatedObj, increment);

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
};
