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
        const doc = await ProjectsData.create(project);

        return { type: "success", message: "Project was successfully created.", data: { _id: doc._id, project_id: doc.project_id } };
    } catch (err) {
        if (err.name == "MongoServerError" && err.code == 11000) {
            return { type: "error", message: "Project with this ID already exists!" };
        } else if (err.name === "ValidationError") {
            return { type: "failure", message: "Required parameters are not provided for creating a new project." };
        };
        logger.error(err.name + ": " + err.message);
    }
};

export const getData = async (query) => {
    try {
        const projects = await ProjectsData.find(query).select({ _id: 0, project_id: 0, __v: 0 });
        return { type: "success", data: projects };

    } catch (err) {
        logger.error(err.name + ": " + err.message);
    };
};

export const updateData = async (projectId, updatedObj, options) => {
    var query = {project_id: projectId};
    var update = {$set: updatedObj};

    await ProjectsData.findOneAndUpdate(query, update, options);
};

export const byId = async (query) => {
    await ProjectsData.findOne(query);
};

export const countTotalProjects = async () => {
    try {
        const value = await ProjectsData.estimatedDocumentCount();
        var str_value = "";

        if (value === 0) {
            str_value = "No Project is"
        } else if (value === 1) {
            str_value = "1 Project is"
        } else {
            str_value = `${value} Projects are`
        };
        return { type: "success", message: str_values + " registered with the site.", data: value }
    } catch (err) {
        logger.error(err.name + ": " + err.message);
    }
}

export default ProjectsData;
