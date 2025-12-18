import express from "express";
import { login, logout } from "../controllers/loginController.js";
import { createRepo, viewRepos } from "../controllers/projectsController.js";
import { isAuthenticated } from "../middleware/authentication.js";
import {
  loginLimit,
  createLimit,
  globalLimit,
  viewLimit,
} from "../middleware/limiter.js";

const router: express.Router = express.Router();

router.post("/login", loginLimit, login);
router.post("/logout", globalLimit, isAuthenticated, logout);
router.post("/createProject", createLimit, isAuthenticated, createRepo);
router.get("/projects/:projectName", viewLimit, viewRepos);
router.get("/projects/:projectName/*splat", viewLimit, viewRepos);

export default router;
