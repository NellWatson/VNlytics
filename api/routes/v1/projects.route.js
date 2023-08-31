// Load modules
import { Router } from "express";

// Load the models
import GameData from "../../models/game_data.model.js";

// Load controller
import { createNewProject, deleteAllProjects, getAllPlatformCount, getOneProject, invalidProjectId, updateProject } from "../../controllers/projects.controller.js";

// Initialise the router
const v1 = Router();

/**
 * @api {GET} /
 * @define Returns an error asking user to give a project ID.
 * @bodyType none
 * @failureExample Failure-Response
 *      HTTP/1.1 200
 *      {
 *          type: "failure",
 *          message: "Please provide a valid Project ID."
 *      }
 */
v1.get("/", invalidProjectId);

/**
 * @api {POST} /
 * @define Registers a new Project with the server.
 * @header {string} Create-Project-Auth - Token for creating a new project. This header needs to be set in the request.
 * @bodyType json
 * @body {string} project_id - ID of the Project. Should be unique and between 8 to 32 characters.
 * @body {string} title - Title of the project.
 * @body {string} developer - Developer of the project.
 * @body {string} engine - Engine used to develop the project.
 * @body {string} [description] - Description of the project.
 * @body {string} [image_url] - URL to the project image.
 * @body {string} [publisher] - Publisher of the project.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "Project was successfully created.",
 *          data: {
 *              _id: <id of the created project>
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
v1.post("/", createNewProject);

/**
 * @api {DELETE} /
 * @define Deletes all the registered Projects with the server. Only works in test environment.
 * @bodyType none
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "All projects have been deleted."
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
v1.delete("/", deleteAllProjects);

/**
 * @api {GET} /:_projectId
 * @define Returns the title of a Project if it exists.
 * @bodyType none
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{poject_title} Project exists."
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
v1.get("/:_projectId", getOneProject);

/**
 * @api {PATCH} /:_projectId
 * @define Update the Project data. Provide atleast one optional parameter.
 * @bodyType json
 * @body {string} id - Internal ID of the project that is return in `data` when a project is registered with the server.
 * @body {string} [title] - Title of the project.
 * @body {string} [developer] - Developer of the project.
 * @body {string} [description] - Description of the project.
 * @body {string} [image_url] - URL to the project image.
 * @body {string} [publisher] - Publisher of the project.
 * @body {string} [engine] - Engine used to develop the project.
 * @successExample Success-Response
 *      HTTP/1.1 200
 *      {
 *          type: "success",
 *          message: "{poject_title} Project has been updated."
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
v1.patch("/:_projectId", updateProject);

// Send back the stats related to the game
v1.get("/:_projectId/platform", getAllPlatformCount);

v1.get("/:_projectId/stats/summary", async (req, res) => {
    var _query = { project_id: req.params._projectId, filled_form: true };
    var _field = "summary";

    GameData.aggregateData( _field, _query, function(err, doc) {

        if ( doc.length == 0 ) {
            res.json({
                "message": "No Data to display"
            });
        } else {
            res.send(doc[0]["Feedback Data"]);
        }
    })
});

v1.get("/:_projectId/stats/player", async (req, res) => {
    var _query = { project_id: req.params._projectId };
    var _field = "player";

    GameData.aggregateData( _field, _query, function(err, doc) {

        if ( doc.length == 0 ) {
            res.json({
                "message": "No Data to display"
            });
        } else {
            res.send(doc[0]);
        }
    })
});

v1.get("/:_projectId/stats/:_queryKey", async (req, res) => {
    var _field = req.params._queryKey;
    
    req.query.project_id = req.params._projectId;

    GameData.aggregateData( _field, req.query, function (err, project) {
        
        if (err) {
            throw err;
        };

        if ( project.length == 0 ) {
            res.json({
                "message": "No Data to display"
            });
        } else {
            res.json(project);
        }
    })
});

export default v1;
