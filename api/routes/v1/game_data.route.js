// Load modules
import { Router } from "express";

// Load controller
import { addNewGameId } from "../../controllers/game_data.controller.js";

// Initialise the router
const v1 = Router();

// Check if we can find the game id in our database
v1.get("/:_gameId", function(req, res) {
    var _gameId = req.params._gameId;

    if (! mongoose.Types.ObjectId.isValid(_gameId)) {
        return res.send("This is not a valid Game ID.")
    }

    GameData.byId( { _id: _gameId }, function (err, doc) {
        
        if (err) {
            throw err;
        };

        // Check whether the Game ID exists in our databse or not.
        if (! doc) {
            return res.send("This Game ID does not exist")
        };

        res.json(doc._id + " was found in our records.");
    })
});

// Create a new Game ID.
v1.post("/", addNewGameId);

v1.post("/:_gameId", function(req, res) {
    var _gameId = req.params._gameId;

    helper.documentExists( GameData, { _id: _gameId } )
        .then(function(c) {
            if ( c == 0 ) {
                return res.send("The provided Game Id does not exist in our database.");
            } else {

                GameData.updatePlayData( _gameId, postObj, function(err, doc) {
                    
                    if (err && err.name === "MongoError" && err.code === 11000) {
                        res.send("This game entry has already been filled!");
                    } else if (err) {
                        throw err;
                    };

                    if (doc) {
                        res.json(doc._id + " was added to our records.");
                    } else {
                        throw err;
                    };
                })
            };
        })

        .catch(function(err) {
            if (err.name == "CastError" && err.kind == "ObjectId") {
                res.send("Please use a valid ID");
            } else {
                throw err;
            }
        });
});

v1.post("/:_gameId/update", function(req, res) {
    var allowedUpdate = [ "founder_name", "founder_startup" ];
    req.body = helper.sanitise(req.body);

    var _gameId = req.params._gameId;
    var updatedObj = helper.validatePost( allowedUpdate, req.body );

    if ( helper.isEmpty(updatedObj) ) {
        return res.send("Please send data to be updated with your request.");
    };

    helper.documentExists( GameData, { _id: _gameId } )
        .then(function(c) {
            if ( c == 0 ) {
                return res.send("The provided Game Id does not exist in our database");
            } else {

                GameData.updateData( _gameId, updatedObj, {}, function(err, doc) {

                    if (err) {
                        console.log(err.name);
                        throw err;
                    };

                    res.json(_gameId + " is marked as finished.");
                })
            }
        })

        .catch(function(err) {
            if (err.name == "CastError" && err.kind == "ObjectId") {
                res.send("Please use a valid ID.");
            } else {
                throw err;
            }
        });
});

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

v1.post("/:_gameId/feedback", function(req, res) {
    req.body = helper.sanitise(req.body);

    var _gameId = req.params._gameId;
    var _field = req.body.field;
    var _data = req.body.data;

    helper.documentExists( GameData, { _id: _gameId, project_id: req._projectId } )
        .then(function(c) {
            if ( c == 0 ) {
                return res.send("The provided Game Id does not exist in our database");
            } else {

                GameData.updateMechanicsData( _gameId, _field, _data, function(err, doc) {

                    if (err) {
                        if (err.name === "MongoError" && err.code === 11000) {
                            res.send("This session has already been finished!");
                        } else if (err.name === "MongoError" && err.code === 9) {
                            res.send("Please provide valid data!");
                        } else {
                            throw err
                        };
                    };

                    if (doc) {
                        res.json("Thank you for your feedback.");
                    };
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

v1.post("/:_gameId/end", function(req, res) {
    var allowedUpdate = [ "play_time", "ending", "filled_form", "sessions", "total_points", "sessions_length", "days" ];
    req.body = helper.sanitise(req.body);

    var _gameId = req.params._gameId;
    var updatedObj = helper.validatePost( allowedUpdate, req.body );

    if ( helper.isEmpty(updatedObj) ) {
        return res.send("Please send data to be updated with your request.");
    };

    endDate = new Date().toISOString();

    helper.documentExists( GameData, { _id: _gameId } )
        .then(function(c) {
            if ( c == 0 ) {
                return res.send("The provided Game Id does not exist in our database");
            } else {

                GameData.updateData( _gameId, updatedObj, endDate, {}, function(err, doc) {

                    if (err) {
                        throw err;
                    };

                    res.json(_gameId + " is marked as finished.");
                })
            }
        })

        .catch(function(err) {
            if (err.name == "CastError" && err.kind == "ObjectId") {
                res.send("Please use a valid ID.");
            } else {
                throw err;
            }
        });
});

export default v1;
