export default {
    projectUpdatableFields: [ "title", "developer", "description", "image_url", "publisher", "engine" ],
    gameDataUpdatableFields: ["total_session", "end_date", "play_time", "ending", "multiple_ids"],
    allowedUpdateMethods: ["play", "relationship", "choice"],
    minProjectIdLength: 8,
    maxProjectIdLength: 24
};
