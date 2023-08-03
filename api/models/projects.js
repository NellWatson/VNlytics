import mongoose from "mongoose";
import logger from "../utils/logger.js";

const projectSchema = mongoose.Schema({
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

var ProjectsData = mongoose.model("ProjectsData", projectSchema);

export const addProject = async (project) => {
    try {
        await ProjectsData.create(project);
    } catch (err) {
        if (err.name == "MongoServerError" && err.code == 11000) {
            return { type: "error", message: "Project with this ID already exists!" };
        }
        logger.error(err);
    }
    
};

export const getData = async (query, limit) => {
    const projects = await ProjectsData.find(query).limit(limit);

    return projects
};

export const updateData = async (projectId, updatedObj, options, callback) => {
    var query = {project_id: projectId};
    var update = {$set: updatedObj};

    await ProjectsData.findOneAndUpdate(query, update, options, callback);
};

export const byId = async (query, callback) => {
    await ProjectsData.findOne(query, callback);
};

export default ProjectsData;
