import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import logger from "./utils/logger.js";

let mongod = null;

mongoose.set('sanitizeFilter', true);
const connectToDatabase = async () => {
    let dbUrl = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_URL}?authMechanism=DEFAULT&authSource=${process.env.DATABASE_SOURCE}`
    
    if (process.env.NODE_ENV === "test") {
        mongod = await MongoMemoryServer.create();
        dbUrl = mongod.getUri();
    };

    mongoose.connect(
        dbUrl
    ).then(() => {
        logger.info("Connected to MongoDB Database.");
    }).catch(err => {
        logger.error("While Connecting: " + err);
    });
};

export default connectToDatabase;

export const disconnectDatabase = async () => {
    try {
        await mongoose.connection.close();
        if (mongod) {
            await mongod.stop();
        };
    } catch (err) {
        logger.error("While Disconnecting: " + err);
    }
};
