import express from "express";
import { login, logout } from "../controllers/loginController.js";
import { createRepo } from "../controllers/projectsController.js";
import { isAuthenticated } from "../middleware/authentication.js";
import { loginLimit, createLimit, globalLimit } from "../middleware/limiter.js";

const router: express.Router = express.Router();

router.post("/login", loginLimit, login);
router.post("/logout", globalLimit, logout);
router.post("/createProject", createLimit, isAuthenticated, createRepo);

export default router;
