import mongoose from "mongoose";
import logger from "../utils/logger.js";

const gameDataSchema = mongoose.Schema({
    project_id: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true,
        cast: false
    },
    display_size: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date
    },
    parent_doc: {
        type: mongoose.Schema.Types.ObjectId
    },
    play_time: {
        type: Number
    },
    sessions: {
        type: Number,
        default: 0
    },
    sessions_length: [
        Number
    ],
    multiple_ids: {
        type: Boolean,
        default: false
    },
    filled_form: {
        type: Boolean,
        default: false
    },
    ending: {
        type: String
    },
    form_data: {
        overall: {
            type: Number,
            min: 0
        },
        ease: {
            type: Number,
            min: 0
        },
        gameplay: {
            type: Number,
            min: 0
        },
        story: {
            type: Number,
            min: 0
        },
        graphics: {
            type: Number,
            min: 0
        },
        sound: {
            type: Number,
            min: 0
        },
        email: {
            type: String
        },
        extra_questions: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    relationship_data: {
        type: mongoose.Schema.Types.Mixed
    },
    choice_data: {
        type: mongoose.Schema.Types.Mixed
    },
    play_data: {
        type: mongoose.Schema.Types.Mixed
    },
    end_data: {
        type: mongoose.Schema.Types.Mixed
    }
});

const GameData = mongoose.model("gameData", gameDataSchema);

const createPipeline = (field, query) => {
    if ( field === "choices" ) {
        return [
            {
                "$match": query
            },
            {
                "$unwind": "$play_data"
            },
            {
                "$unwind": "$play_data.choices"
            },
            {
                "$group": {
                    "_id": {
                        "label": "$play_data.choices.label",
                        "caption": "$play_data.choices.caption"
                    },
                    "count": {
                        "$sum": 1
                    }
                }
            },
            {
                "$group": {
                    "_id": "$_id.label",
                    "choices": { 
                        "$push": {
                            "caption": "$_id.caption",
                            "count": "$count"
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 0, "label": "$_id", "choices": 1
                }
            }
        ];
    } else if ( [ "platform", "display_size" ].indexOf(field) > -1 ) {
        return [
            {
                "$match": query
            },
            {
                "$group": {
                    "_id": "$" + field,
                    "count": {
                        "$sum": 1
                    }
                }
            }
        ];
    } else if ( field === "summary" ) {
        return [
            {
                "$match": query
            },
            {
                "$group": {
                    "_id": "_id",
                    "Feedback Data": {
                        "$push": {
                            "Player ID": "$_id",
                            "Overall Experience": "$form_data.overall",
                            "Ease of Use": "$form_data.ease",
                            "Gameplay": "$form_data.gameplay",
                            "Story": "$form_data.story",
                            "Graphics": "$form_data.graphics",
                            "Sound": "$form_data.sound",
                            "Extra Questions": "$form_data.extra_questions",
                            "Email": "$form_data.email"
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "Feedback Data": 1
                }
            }
        ];
    } else if ( field === "player" ) {
        return [
            {
                "$match": query
            },
            {
                "$unwind": "$sessions_length"
            },
            {
                "$unwind": "$end_data"
            },
            {
                "$group": {
                    "_id": "_id",
                    "Total Play": {
                        "$sum": 1
                    },
                    "Total Unique Users": {
                        "$sum": {
                            "$cond": [ { "$eq": [ "$multiple_ids", false ] }, 1, 0 ]
                        }
                    },
                    "Total Users -- Single Session": {
                        "$sum": {
                            "$cond": [ { "$eq": [ "$sessions", 1 ] }, 1, 0 ]
                        }
                    },
                    "Total Users -- Multi Session": {
                        "$sum": {
                            "$cond": [ { "$gt": [ "$sessions", 1 ] }, 1, 0 ]
                        }
                    },
                    "Total Sessions": {
                        "$sum": "$sessions"
                    },
                    "Average Session per User": {
                        "$avg": "$sessions"
                    },
                    "Average Session Length": {
                        "$avg": {
                            "$divide": [ "$sessions_length", 60 ]
                        } 
                    },
                    "Users who completed the game": {
                        "$sum": {
                            "$cond": [ { "$eq": [ "$ending", "done" ] }, 1, 0 ]
                        }
                    },
                    "Users who did not complete the game": {
                        "$sum": {
                            "$cond": [ { "$ne": [ "$ending", "done" ] }, 1, 0 ]
                        }
                    },
                    "Average XP": {
                        "$avg": "$end_data.total_points"
                    },
                    "Average Days (Users who got bad end)": {
                        "$avg": {
                            "$cond": [ { "$ne": [ "$ending", "done" ] }, "$end_data.days", 0 ]
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "Total Play": 1,
                    "Total Unique Users": 1,
                    "Total Users -- Single Session": 1,
                    "Total Users -- Multi Session": 1,
                    "Total Sessions": 1,
                    "Average XP": 1,
                    "Average Session per User": 1,
                    "Average Session Length": 1,
                    "Users who completed FP": 1,
                    "Users who did not complete FP": 1,
                    "Average Days (Users who got bad end)": 1
                }
            }
        ];
    } else {
        return [
            {
                "$match": query
            },
            {
                "$unwind": "$play_data"
            },
            {
                "$group": {
                    "_id": {
                        value: "$play_data." + field
                    },
                    "count": {
                        "$sum": 1
                    }
                }
            }
        ];
    };
};

export default GameData;

// Intialise Game ID
export const addGameId = async (gameDataObj, callback) => {
    try {
        const doc = await GameData.create(gameDataObj);
        return { type: "success", message: "Game Instance was successfully created.", data: { _id: doc._id, project_id: doc.project_id } };

    } catch (err) {
        if (err.name === "ValidationError") {
            return { type: "failure", message: "Required parameters are not provided for creating a new game instance." };
        };

        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    }
};

export const getData = (callback, limit) => {
    GameData.find(callback).limit(limit);
};

export const updateGameFields = async (gameId, updatedObj, increment = false) => {
    try {
        const doc = await GameData.findById(gameId);
        
        if (doc === null) {
            return { type: "failure", message: doc._id + " could not be found in our records." };
        };
    
        if (updatedObj.hasOwnProperty("sessions")) {
            if (updatedObj["sessions"] <= 0) {
                return { type: "failure", message: "Sessions can only be a positive number." };
            };

            if (doc.sessions === undefined) {
                doc["sessions"] = 0;
            };

            if (increment === true) {
                doc["sessions"] += updatedObj["sessions"];

            } else {
                doc["sessions"] = updatedObj["sessions"];
            };
        };
    
        if (!updatedObj.hasOwnProperty("play_time")) {
            doc["play_time"] = updatedObj["play_time"];
        };
    
        if (updatedObj.hasOwnProperty("multiple_ids")) {
            doc["multiple_ids"] = true;
        };
    
        if (updatedObj.hasOwnProperty("sessions_length")) {
            if (Array.isArray(updatedObj["sessions_length"]) === true) {
                if (!doc["sessions_length"].every(i => typeof i === "number" && i > 0)) {
                    return { type: "failure", message: "Session length values can only be positive numbers." };
                };

                if (!updatedObj["sessions_length"].every(i => typeof i === "number" && i > 0)) {
                    return { type: "failure", message: "Session length values can only be positive numbers." };
                };

                if (increment === true){
                    if (updatedObj["sessions_length"].length != updatedObj["sessions"]) {
                        return { type: "failure", message: "Number of sessions and session length should be same." };
                    };

                    doc["sessions_length"].push(...updatedObj["sessions_length"]);

                } else {
                    doc["sessions_length"] = updatedObj["sessions_length"];
                };

            } else {
                if (updatedObj["sessions_length"] <= 0) {
                    return { type: "failure", message: "Session length values can only be a positive number." };
                };

                if (increment === true) {
                    if (updatedObj["sessions"] != 1) {
                        return { type: "failure", message: "Number of sessions and sessions length should be same." };
                    };

                    doc["sessions_length"].push(updatedObj["sessions_length"]);

                } else {
                    doc["sessions_length"] = [updatedObj["sessions_length"]];
                };
            };
        };

        if (doc.end_date != undefined) {
            const newDocObj = doc.toObject();
            newDocObj.multiple_ids = true;

            delete newDocObj._id;
            delete newDocObj.end_date;
            delete newDocObj.ending;
            delete newDocObj.end_data;

            if (newDocObj.parent_doc === undefined) {
                newDocObj.parent_doc = gameId;
            };

            const newDoc = await GameData.create(newDocObj);
            return { type: "success", message: "A new game Instance was successfully created from the existing one.", data: { _id: newDoc._id, project_id: newDoc.project_id } };
        };
        
        await doc.save();
        return { type: "success", message: doc._id + " Game Instance has been updated." };

    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    };
};

export const updateRelationshipData = async (gameId, updatedRelationshipDataKey, updatedRelationshipData, increment = false) => {
    try {
        const doc = await GameData.findById(gameId);
        
        if (doc === null) {
            return { type: "failure", message: doc._id + " could not be found in our records." };
        };

        const relationshipData = doc.relationship_data || {};
        
        if (Array.isArray(updatedRelationshipDataKey) === true) {
            if (updatedRelationshipDataKey.length != updatedRelationshipData.length) {
                return { type: "failure", message: "Key and data length do not match." };
            };

            if (!updatedRelationshipDataKey.every(i => typeof i === "string")) {
                return { type: "failure", message: "Relationship key can only be strings." };
            };

            if (!updatedRelationshipData.every(i => typeof i === "number")) {
                return { type: "failure", message: "Relationship value can only be numbers." };
            };

            for (let i in updatedRelationshipDataKey) {
                if (relationshipData.hasOwnProperty(updatedRelationshipDataKey[i]) && increment === true) {
                    relationshipData[updatedRelationshipDataKey[i]] += updatedRelationshipData[i];
                } else {
                    relationshipData[updatedRelationshipDataKey[i]] = updatedRelationshipData[i];
                };
            };

        } else {
            if (typeof updatedRelationshipDataKey != "string") {
                return { type: "failure", message: "Relationship key can only be a string." };
            };

            if (typeof updatedRelationshipData != "number") {
                return { type: "failure", message: "Relationship value can only be a number." };
            };

            if (relationshipData.hasOwnProperty(updatedRelationshipDataKey) && increment === true) {
                relationshipData[updatedRelationshipDataKey] += updatedRelationshipData;
            } else {
                relationshipData[updatedRelationshipDataKey] = updatedRelationshipData;
            };
        };

        doc.relationship_data = relationshipData;
        doc.markModified("relationship_data");

        if (doc.end_date != undefined) {
            const newDocObj = doc.toObject();
            newDocObj.multiple_ids = true;

            delete newDocObj._id;
            delete newDocObj.end_date;
            delete newDocObj.ending;
            delete newDocObj.end_data;

            if (newDocObj.parent_doc === undefined) {
                newDocObj.parent_doc = gameId;
            };

            const newDoc = await GameData.create(newDocObj);
            return { type: "success", message: "A new game Instance was successfully created from the existing one.", data: { _id: newDoc._id, project_id: newDoc.project_id } };
        };
        
        await doc.save();
        return { type: "success", message: doc._id + " Game Instance has been updated." };

    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    };
};

export const updateChoiceData = async (gameId, updatedChoiceDataKey, updatedChoiceData) => {
    try {
        const doc = await GameData.findById(gameId);
        
        if (doc === null) {
            return { type: "failure", message: doc._id + " could not be found in our records." };
        };

        const choiceData = doc.choice_data || {};
        
        if (Array.isArray(updatedChoiceDataKey) === true) {
            if (updatedChoiceDataKey.length != updatedChoiceData.length) {
                return { type: "failure", message: "Key and data length do not match." };
            };

            if (!updatedChoiceDataKey.every(i => typeof i === "string")) {
                return { type: "failure", message: "Choice keys can only be strings." };
            };

            if (!updatedChoiceData.every(i => typeof i === "string")) {
                return { type: "failure", message: "Choice values can only be strings." };
            };

            for (let i in updatedChoiceDataKey) {
                choiceData[updatedChoiceDataKey[i]] = updatedChoiceData[i];
            };

        } else {
            if (!updatedChoiceDataKey != "string") {
                return { type: "failure", message: "Choice key can only be a string." };
            };

            if (typeof updatedChoiceData != "string") {
                return { type: "failure", message: "Choice text can only be a string." };
            };

            choiceData[updatedChoiceDataKey] = updatedChoiceData;
        };

        doc.choice_data = choiceData;
        doc.markModified("choice_data");

        if (doc.end_date != undefined) {
            const newDocObj = doc.toObject();
            newDocObj.multiple_ids = true;

            delete newDocObj._id;
            delete newDocObj.end_date;
            delete newDocObj.ending;
            delete newDocObj.end_data;

            if (newDocObj.parent_doc === undefined) {
                newDocObj.parent_doc = gameId;
            };

            const newDoc = await GameData.create(newDocObj);
            return { type: "success", message: "A new game Instance was successfully created from the existing one.", data: { _id: newDoc._id, project_id: newDoc.project_id } };
        };
        
        await doc.save();
        return { type: "success", message: doc._id + " Game Instance has been updated." };

    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    }
};

export const updatePlayData = async (gameId, updatedPlayDataKey, updatedPlayData) => {
    try {
        const doc = await GameData.findById(gameId);
        
        if (doc === null) {
            return { type: "failure", message: doc._id + " could not be found in our records." };
        };

        const playData = doc.play_data || {};

        if (Array.isArray(updatedPlayDataKey) === true) {
            if (updatedPlayDataKey.length != updatedPlayData.length) {
                return { type: "failure", message: "Key and data length do not match." };
            };

            if (!updatedPlayDataKey.every(i => typeof i === "string")) {
                return { type: "failure", message: "Play keys can only be strings." };
            };

            for (const i in updatedPlayDataKey) {
                if (!playData.hasOwnProperty(updatedPlayDataKey[i])) {
                    playData[updatedPlayDataKey[i]] = {}
                };

                if (updatedPlayData[i].constructor != Object) {
                    playData[updatedPlayDataKey[i]] = updatedPlayData;
                    continue;
                };

                for (const key in updatedPlayData[i]) {
                    playData[updatedPlayDataKey[i]][key] = updatedPlayData[i][key];
                };
            };
            
        } else {
            if (typeof updatedPlayDataKey != "string") {
                return { type: "failure", message: "Play key can only be a string." };
            };

            if (updatedPlayData.constructor === Object) {
                for (const key in updatedPlayData) {
                    if (!playData.hasOwnProperty(updatedPlayDataKey)) {
                        playData[updatedPlayDataKey] = {};
                    };

                    playData[updatedPlayDataKey][key] = updatedPlayData[key];
                };

            } else {
                if (typeof updatedPlayDataKey != "string") {
                    return { type: "failure", message: "Play key can only be a string." };
                };
    
                playData[updatedPlayDataKey] = updatedPlayData;
            };
        };

        doc.play_data = playData;
        doc.markModified("play_data");

        if (doc.end_date != undefined) {
            const newDocObj = doc.toObject();
            newDocObj.multiple_ids = true;

            delete newDocObj._id;
            delete newDocObj.end_date;
            delete newDocObj.ending;
            delete newDocObj.end_data;

            if (newDocObj.parent_doc === undefined) {
                newDocObj.parent_doc = gameId;
            };

            const newDoc = await GameData.create(newDocObj);
            return { type: "success", message: "A new game Instance was successfully created from the existing one.", data: { _id: newDoc._id, project_id: newDoc.project_id } };
        };
        
        await doc.save();
        return { type: "success", message: doc._id + " Game Instance has been updated." };

    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    };
};

export const byId = async (query) => {
    try {
        const doc = await GameData.findOne(query);

        if (doc === null) {
            return { type: "failure", message: query._id + " Game Instance does not exist." };
        } else {
            return { type: "success", message: query._id + " Game Instance exists." };
        }
    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    };
};

export const aggregateData = (field, query, callback ) => {
    var pipeline = createPipeline( field, query );

    GameData.aggregate( pipeline, callback );
};

export const addFormData = (gameId, formObj, callback) => {
    var query = { _id: gameId, filled_form: false };
    var update = { $set: { "filled_form": true, "form_data": formObj } };
    var options = { upsert: true };

    GameData.findOneAndUpdate(query, update, options, callback);
};
