import express from "express";
import { login } from "../controllers/loginController.js";
import { createRepo } from "../controllers/projectsController.js";
import { isAuthenticated } from "../middleware/authentication.js";

const router: express.Router = express.Router();

router.post("/login", login);
router.post("/createProject", isAuthenticated, createRepo);

export default router;
