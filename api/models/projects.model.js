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

const ProjectsData = mongoose.model("ProjectsData", projectSchema);
const debugVisible = process.env.NODE_ENV === "development" ? 1 : 0;

export const addProject = async (project) => {
    try {
        const doc = await ProjectsData.create(project);
        return { type: "success", message: "Project was successfully created.", data: { _id: doc._id, project_id: doc.project_id } };
        
    } catch (err) {
        if (err.name == "MongoServerError" && err.code == 11000) {
            return { type: "failure", message: "Project with this ID already exists!" };
        } else if (err.name === "ValidationError") {
            return { type: "failure", message: "Required parameters are not provided for creating a new project." };
        };
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    }
};

export const getData = async (query) => {
    try {
        const projects = await ProjectsData.find(query).select({ _id: debugVisible, project_id: debugVisible, title: 1, description: 1, developer: 1, engine: 1, __v: debugVisible });
        return { type: "success", data: projects };

    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    };
};

export const updateData = async (query, updatedObj) => {
    const update = { $set: updatedObj };

    try {
        const doc = await ProjectsData.findOneAndUpdate(query, update, { new: true });
        
        if (doc === null) {
            return { type: "failure", message: query.project_id + " Project either does not exist or a valid ID was not provided." };
        } else {
            return { type: "success", message: doc.title + " Project has been updated." };
        }
    } catch (err) {
        if (err.name === "CastError" && err.path === "_id") {
            return { type: "failure", message: "An invalid ID was provided." };
        };
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    }
    
};

export const deleteData = async () => {
    try {
        const doc = await ProjectsData.deleteMany({});
    
        if (doc.ok === 1 || doc.acknowledged === true) {
            return { type: "success", message: "All projects have been deleted." };
        } else {
            return { type: "failure", message: "Some error occured." }
        }
    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    }
}

export const byId = async (query) => {
    try {
        const doc = await ProjectsData.findOne(query);
        
        if (doc === null) {
            return { type: "failure", message: query.project_id + " Project does not exist." };
        } else {
            return { type: "success", message: doc.title + " Project exists." };
        }
    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    };
};

export const countTotalProjects = async () => {
    try {
        const value = await ProjectsData.estimatedDocumentCount();
        let str_value = "";

        if (value === 0) {
            str_value = "No Project is"
        } else if (value === 1) {
            str_value = "1 Project is"
        } else {
            str_value = `${value} Projects are`
        };
        return { type: "success", message: str_value + " registered with the site.", data: value }
    } catch (err) {
        logger.error(err.name + ": " + err.message);
        return { type: "error", message: "Internal Server Error. Contact administrator." }
    }
}

export default ProjectsData;
