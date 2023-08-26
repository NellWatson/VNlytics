// Load modules
import { Router } from "express";

// Load controller
import * as projectController from "../../controllers/game_data.controller.js";

// Initialise the router
const v1 = Router();

// Check if the project exists
v1.use(projectController.checkIfPathValid);

// Create a new Game ID.
v1.post("/", projectController.addNewGameId);

// Check if we can find the game id in our database
v1.get("/:_gameId", projectController.getById);

v1.patch("/:_gameId", projectController.updateGameInstanceData);

v1.delete("/:_gameId", projectController.deleteGameInstance);

v1.patch("/:_gameId/batch", projectController.updateGameDataBatch);

v1.patch("/:_gameId/relationship", projectController.updateGameRelationshipData);

v1.patch("/:_gameId/choice", projectController.updateGameChoiceData);

v1.patch("/:_gameId/play", projectController.updateGamePlayData);

v1.patch("/:_gameId/end", projectController.endGameData);

v1.post("/:_gameId/form", function(req, res) {
    req.body = helper.sanitise(req.body);

    var _gameId = req.params._gameId;

    helper.documentExists( GameData, { _id: _gameId, project_id: req._projectId } )
        .then(function(c) {
            if ( c == 0 ) {
                return res.send("The provided Game Id does not exist in our database");
            } else {

                GameData.addFormData( _gameId, req.body, function(err, doc) {

                    if (err) {
                        if (err.name === "MongoError" && err.code === 11000) {
                            res.send("This session has already been finished!");
                        } else if (err.name === "MongoError" && err.code === 9) {
                            res.send("Please provide valid data!");
                        } else {
                            throw err
                        };
                    }

                    if (doc) {
                        res.json("Thank you for your feedback.");
                    }
                })
            }
        })

        .catch(function(err) {
            if (err.name === "CastError" && err.kind === "ObjectId") {
                res.send("Please use a valid ID.");
            } else {
                throw err;
            }
        });
});

export default v1;
