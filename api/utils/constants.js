export default {
    projectUpdatableFields: [ "title", "developer", "description", "image_url", "publisher", "engine" ],
    gameDataUpdatableFields: ["play_time", "multiple_ids", "sessions", "sessions_length"],
    allowedUpdateMethods: ["play", "relationship", "choice"],
    minProjectIdLength: 8,
    maxProjectIdLength: 24
};
