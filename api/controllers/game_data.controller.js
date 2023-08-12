import geoip from "geoip-lite";
import mongoose from "mongoose";

// Load the models
import ProjectsData from "../models/projects.model.js";
import GameData, { addGameId, byId } from "../models/game_data.model.js";

// Load helper function
import helper from "../utils/helper.js";

export const addNewGameId = async (req, res) => {
    // Check if the Project ID is in the file.
    const gameExistsCount = await helper.documentExists( ProjectsData, {project_id: req.projectId} );

    if ( gameExistsCount === 0 ) {
        return res.status(400).json({
            type: "failure",
            message: "The provided Project ID does not exist in our database."
        });
    };

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

export const getById = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params._gameId)) {
        return res.status(400).json({
            type: "failure",
            message: "Please provide a valid Game ID."})
    };

    const data = await byId( { _id: req.params._gameId })

    if (data.type === "error") {
        res.status(500).json(data);
    } else if (data.type === "failure") {
        res.status(400).json(data);
    } else if ( data.type === "success" ) {
        res.status(200).json(data);
    };
}
