// Loading the modules
import { Router } from "express";
import v1 from "./v1/index.js";

// Initialise the router
const router = Router();

// Load all the available API routes
router.use("/v1", v1);

export default router;
