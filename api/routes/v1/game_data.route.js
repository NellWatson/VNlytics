// Load modules
import { Router } from "express";

// Load controller
import * as gameDataController from "../../controllers/game_data.controller.js";

// Initialise the router
const v1 = Router();

/**
 * @define Check to see if the Project ID and Game Instance ID is valid. Runs for every request.
 * @body None
 * @success Moves to route specific function.
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 **/
v1.use(gameDataController.checkIfPathValid);

/**
 * @api {POST} /
 * @define Creates a new Game ID.
 * @bodyType json
 * @body {string} platform - Platform of the gaming device.
 * @body {string} display_size - Display size of the gaming device.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "Game Instance was successfully created.",
 *          data: {
 *              _id: <id of the created game instance>
 *              project_id: <project id of the given project>
 *          }
 *      }
 *  @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 **/
v1.post("/", gameDataController.addNewGameId);

/**
 * @api {GET} /:_gameId
 * @define Check if we can find the game id in our database.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance exists."
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: "{_gameId} Game Instance does not exist."
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 **/
v1.get("/:_gameId", gameDataController.getById);

/**
 * @api {PATCH} /:_gameId
 * @define Update the Game Instance data. Provide atleast one parameter.
 * @bodyType json
 * @body {number} [sessions] - Number of sessions player has played. Should be provided if sessions_length is provided. Can only be a
 *                             positive number.
 * @body {number|Array<number>} [sessions_length] - Total length (in seconds) of the sessions. Should be provided if sessions is provided.
 *                                                  Can only be a positive number or an array containing positive number.
 * @body {number} [play_time] - Total play time of the player in seconds. Can only be a positive number.
 * @body {boolean} [multiple_ids] - Set to True if multiple games have been played from the same id.
 * @body {boolean} [increment] - If set to True, sessions and sessions_length append to the existing values, otherwise they replace them.
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 **/
v1.patch("/:_gameId", gameDataController.updateGameInstanceData);

/**
 * @api {DELETE} /:_gameId
 * @define Delete the Game Instance.
 * @body None
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "Game Instance was successfully deleted."
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: "Game Instance with this ID was not found."
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.delete("/:_gameId", gameDataController.deleteGameInstance);

/**
 * @api {PATCH} /:_gameId/batch
 * @define Handle multiple API request in a batch. Requests are processed one after the other and any request can
 *         fail but it will not cause the entire batch request to fail.
 * @bodyType json
 * @body {Array<Object>} - An array containing objects. Each object must have a `type` property which can only be
 *                         one of the following, `self`, `relationship`, `choice`, `play`. After the `type` property,
 *                         other properties related to that endpoint must be given.
 * @success Returns an object composed of the same number of responses as the given objects, with provided `type` as
 *          the property name and a response object as it;s value. If a new Game Instance was created, there will be
 *          an additional property called `_id` which will have the new Game Instance ID. All future updates must be
 *          performed on this.
 *          In case of partial success (where one or more but less than all requests fail), a status code of 201 is
 *          returned.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      [
 *          {
 *              type: "success",
 *              message: "{_gameId} Game Instance has been updated."
 *          }
 *      ]
 * @failure Returns an object composed of the same number of responses as the given objects, with provided `type` as
 *          the property name and a response object as it;s value. If a new Game Instance was created, there will be
 *          an additional property called `_id` which will have the new Game Instance ID. All future updates must be
 *          performed on this.
 *          In case of partial success (where one or more but less than all requests fail), a status code of 201 is
 *          returned.
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      [
 *          {
 *              type: "failure",
 *              message: <Can be different depending upon failure>
 *          }
 *      ]
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.patch("/:_gameId/batch", gameDataController.updateGameDataBatch);

/**
 * @api {PATCH} /:_gameId/relationship
 * @define Updates the relationship data of the Game Instance.
 * @bodyType json
 * @body {string|Array<string>} key - The keys under which the value will be stored. Should not be a string that's only numbers, ie,
 *                                    "1234" and should not contain $ symbol. If this is an array, then data should also be an array
 *                                    of same length.
 * @body {number|Array<number>} data - The values associated with the keys. If it's an array, then it's length should be the same as the
 *                                     array length of key.
 * @body {boolean} [increment] - If given, the values will be added into the existing values. If not given or false, then the values will
 *                               be replaced.
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.patch("/:_gameId/relationship", gameDataController.updateGameRelationshipData);

/**
 * @api {PATCH} /:_gameId/choice
 * @define Updates the choice data of the Game Instance.
 * @bodyType json
 * @body {string|Array<string>} key - The keys under which the value will be stored. Should not be a string that's only numbers, ie,
 *                                    "1234" and should not contain $ symbol. If this is an array, then data should also be an array
 *                                    of same length.
 * @body {string|Array<string>} data - The values associated with the keys. If it's an array, then it's length should be the same as the
 *                                     array length of key.
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.patch("/:_gameId/choice", gameDataController.updateGameChoiceData);

/**
 * @api {PATCH} /:_gameId/play
 * @define Updates the play data of the Game Instance.
 * @bodyType json
 * @body {string|Array<string>} key - The keys under which the value will be stored. Should not be a string that's only numbers, ie,
 *                                    "1234" and should not contain $ symbol. If this is an array, then data should also be an array
 *                                    of same length.
 * @body {*|Array<*>} data - The values associated with the keys. If it's an array, then it's length should be the same as the array
 *                           length of key. When data is an object, individual properties can be updated of the object, so you don't need
 *                           to pass the entire object to update or add one key, value pair.
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.patch("/:_gameId/play", gameDataController.updateGamePlayData);

/**
 * @api {PATCH} /:_gameId/end
 * @define Marks the Game Instance as done.
 * @bodyType json
 * @body {number} [sessions] - Number of sessions player has played. Should be provided if sessions_length is provided. Can only be a
 *                             positive number.
 * @body {number|Array<number>} sessions_length - Total length (in seconds) of the sessions. Should be provided if sessions is provided.
 *                                                Can only be a positive number or an array containing positive number.
 * @body {number} play_time - Total play time of the player in seconds. Can only be a positive number.
 * @body {string} ending - The name of the ending that the player has gotten.
 * @body {*} [end_data] - The data associated with the ending of the game.
 * @body {object} [relationship_data] - Follow the body format of /:_gameId/relationship
 * @body {object} [choice_data] - Follow the body format of /:_gameId/choice
 * @body {object} [play_data] - Follow the body format of /:_gameId/play
 * @body {boolean} [increment] - If set to True, sessions and sessions_length append to the existing values, otherwise they replace them.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been marked as finished."
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 **/
v1.patch("/:_gameId/end", gameDataController.endGameData);

/**
 * @api {PUT} /:_gameId/relationship
 * @define Replaces the relationship data of the Game Instance.
 * @bodyType json
 * @body {object} - The keys of this object should be strings. The values of this object should be numbers. Both of these should follow 
 *                  all the requirements of the `key` and `data` property in {PATCH} /:_gameId/relationship
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.put("/:_gameId/relationship", gameDataController.replaceGameChoiceData);

/**
 * @api {PUT} /:_gameId/choice
 * @define Replaces the choice data of the Game Instance.
 * @bodyType json
 * @body {object} - The keys of this object should be strings. The values of this object should be strings. Both of these should follow 
 *                  all the requirements of the `key` and `data` property in {PATCH} /:_gameId/choice
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.put("/:_gameId/choice", gameDataController.replaceGameChoiceData);

/**
 * @api {PUT} /:_gameId/play
 * @define Replaces the play data of the Game Instance.
 * @bodyType json
 * @body {object} - The keys of this object should be strings. Both of these should follow all the requirements of the `key` and `data`
 *                  property in {PATCH} /:_gameId/play
 * @success Returns an object. Typically only has two properties, `type` and `message`. If a Game Instance that has already been marked as
 *          finished is updated, a new Game Instance is created and it is returned under a new property, `data`.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{_gameId} Game Instance has been updated."
 *      }
 * 
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "A new game Instance was successfully created from the existing one."
 *          data: {
 *              _id: <new gameId>,
 *              project_id: <id of the project>
 *          }
 *      }
 * @failureExample Failure-Response
 *      HTTP/1.1 400
 *      {
 *          type: "failure",
 *          message: <Can be different depending upon failure>
 *      }
 * @errorExample Error-Response
 *      HTTP/1.1 500
 *      {
 *          type: "error",
 *          message: "Internal Server Error. Contact administrator."
 *      }
 */
v1.put("/:_gameId/play", gameDataController.replaceGameRelationshipData);

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
