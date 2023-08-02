import mongoose from "mongoose";

var projectSchema = mongoose.Schema({
    project_id: {
        type: String,
        required: true,
        unique: true,
        minlength: 8,
        maxlength: 24,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    developer: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image_url: {
        type: String
    },
    publisher: {
        type: String
    },
    engine: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var ProjectsData = mongoose.model("projectsData", projectSchema);

export default ProjectsData;

export const addProject = (project, callback) => {
    ProjectsData.create(project, callback);
};

export const getData = (callback, limit) => {
    ProjectsData.find(callback).limit(limit);
};

export const updateData = (projectId, updatedObj, options, callback) => {
    var query = {project_id: projectId};
    var update = {$set: updatedObj};

    ProjectsData.findOneAndUpdate(query, update, options, callback);
};

export const byId = (query, callback) => {
    ProjectsData.findOne(query, callback);
};
