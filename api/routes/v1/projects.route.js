// Load modules
import { Router } from "express";

// Load the models
import GameData from "../../models/game_data.model.js";

// Load controller
import { createNewProject, deleteAllProjects, getAllPlatformCount, getOneProject, invalidProjectId, updateProject } from "../../controllers/projects.controller.js";

// Load helper function
import helper from "../../utils/helper.js";

// Initialise the router
const v1 = Router();

// If no Project ID is provided, tell the user to provide one
v1.get("/", invalidProjectId);

// Allow user to create their own project
v1.post("/", createNewProject);

// Allow user to create their own project
v1.delete("/", deleteAllProjects);

// Check if we can find the project in our database
v1.get("/:_projectId", getOneProject);

// Update the provided project.
v1.put("/:_projectId", updateProject);

// Send back the stats related to the game
v1.get("/:_projectId/platform", getAllPlatformCount);

v1.get("/:_projectId/summary", async (req, res) => {
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

v1.get("/:_projectId/player", async (req, res) => {
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

v1.get("/:_projectId/:_queryKey", async (req, res) => {
    var _field = req.params._queryKey;
    
    req.query = helper.sanitise(req.query);
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
