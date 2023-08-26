export default {
    projectDataInitFields: {
        "project_id": ["string"],
        "title": ["string"],
        "developer": ["string"],
        "engine": ["string"]
    },
    projectUpdatableFields: {
        "title": ["string"],
        "developer": ["string"],
        "description": ["string"],
        "image_url": ["string"],
        "publisher": ["string"],
        "engine": ["string"]
    },
    gameDataInitFields: {
        "platform": ["string"],
        "display_size": ["string"]
    },
    gameDataUpdatableFields: {
        "play_time": ["number"],
        "multiple_ids": ["boolean"],
        "sessions": ["number"],
        "sessions_length": ["number", "array"],
        "increment": ["boolean"]
    },
    endGameDataFields: {
        "play_time": ["number"],
        "ending": ["string"],
        "sessions": ["number"],
        "sessions_length": ["number", "array"],
        "end_data": ["object"],
        "relationship_data": ["object"],
        "choice_data": ["object"],
        "play_data": ["object"],
    },
    allowedUpdateMethods: ["self", "play", "relationship", "choice"],
    minProjectIdLength: 8,
    maxProjectIdLength: 24
};
