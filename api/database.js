import mongoose from "mongoose";
import logger from "./utils/logger.js";

const connectToDatabase = () => {
    mongoose.connect(
        `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_URL}?authMechanism=DEFAULT&authSource=${process.env.DATABASE_SOURCE}`
    ).then(() => {
        logger.info("Connected to MongoDB Database.");
    }).catch(error => {
        logger.error(error);
    });
}

export default connectToDatabase;
