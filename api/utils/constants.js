export default {
    projectUpdatableFields: {
        "title": ["string"],
        "developer": ["string"],
        "description": ["string"],
        "image_url": ["string"],
        "publisher": ["string"],
        "engine": ["string"]
    },
    gameDataUpdatableFields: {
        "play_time": ["number"],
        "multiple_ids": ["boolean"],
        "sessions": ["number"],
        "sessions_length": ["number", "array"]
    },
    allowedUpdateMethods: ["play", "relationship", "choice"],
    minProjectIdLength: 8,
    maxProjectIdLength: 24
};
