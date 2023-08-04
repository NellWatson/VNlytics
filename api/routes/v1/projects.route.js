// Load modules
import { Router } from "express";

// Load the models
import { byId, updateData } from "../../models/projects.model.js";
import GameData from "../../models/game_data.model.js";

// Load controller
import { createNewProject, getOneProject, invalidProjectId } from "../../controller/projects.controller.js";

// Load helper function
import helper from "../../utils/helper.js";

// Initialise the router
const v1 = Router();

// If no Project ID is provided, tell the user to provide one.
v1.get("/", invalidProjectId);

v1.post("/", createNewProject);

// Check if we can find the project in our database
v1.get("/:_projectId", getOneProject);

v1.put("/:_projectId", async (req, res) => {
    var _projectId = req.params._projectId;
    var allowedUpdate = [ "title", "developer" ];

    var updatedObj = helper.validatePost( allowedUpdate, req.body );

    if (helper.isEmpty(updatedObj)) {
        return res.send("Please send data to be updated with your request.");
    }

    updateData( _projectId, updatedObj, {}, function (err, doc) {
        
        if (err) {
            throw err;
        };

        // Check whether the Project ID exists in our databse or not.
        if (! doc) {
            return res.send("This Project does not exist")
        };
        res.json(doc.title + " was found in our records.");

    })
});

// Send back the stats related to the game
v1.get("/:_projectId/platform", async (req, res) => {
    var _query = { project_id: req.params._projectId };
    var _field = "platform";
    
    req.query = helper.sanitise(req.query);

    if ( "unique" in req.query ) {
        _query.multiple_ids = false;
    };
    
    if ( "resolution" in req.query ) {
        if ( req.query.resolution === "full hd" ) {
            _query.display_size = "(1920, 1080)";
        } else if ( req.query.resolution === "hd" ) {
            _query.display_size = "(1280, 720)";
        } else {
            _query.display_size = req.query.resolution;
        }
    };

    GameData.aggregateData( _field, _query, function(err, doc) {
        res.send(doc);
    })
});

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
