export default {
    projectDataInitFields: {
        "project_id": {
            type: "string",
            required: true
        },
        "title": {
            type: "string",
            required: true
        },
        "developer": {
            type: "string",
            required: true
        },
        "engine": {
            type: "string",
            required: true
        },
        "description": {
            type: "string"
        },
        "image_url": {
            type: "string"
        },
        "publisher": {
            type: "string"
        }
    },
    projectUpdatableFields: {
        "title": {
            type: "string"  
        },
        "developer": {
            type: "string"
        },
        "description": {
            type: "string"
        },
        "image_url": {
            type: "string"
        },
        "publisher": {
            type: "string"
        },
        "engine": {
            type: "string"
        }
    },
    gameDataInitFields: {
        "platform": {
            type: "string",
            required: true
        },
        "display_size": {
            type: "string",
            required: true
        }
    },
    gameDataUpdatableFields: {
        "play_time": {
            type: "number"
        },
        "multiple_ids": {
            type: "boolean"
        },
        "sessions": {
            type: "number"
        },
        "sessions_length": {
            type: ["number", "array"]
        },
        "increment": {
            type: "boolean"
        }
    },
    endGameDataFields: {
        "play_time": {
            type: "number",
            required: true
        },
        "ending": {
            type: "string",
            required: true
        },
        "sessions": {
            type: "number",
            required: true
        },
        "sessions_length": {
            type: ["number", "array"],
            required: true
        },
        "end_data": {
            type: "object"
        },
        "relationship_data": {
            type: "object"
        },
        "choice_data": {
            type: "object"
        },
        "play_data": {
            type: "object"
        },
        "increment": {
            type: "boolean"
        }
    },
    allowedUpdateMethods: ["self", "play", "relationship", "choice"],
    minProjectIdLength: 8,
    maxProjectIdLength: 24
};
