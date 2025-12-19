import express from "express";
import { login, logout } from "../controllers/loginController.js";
import {
  createRepo,
  viewRepos,
  viewAllRepos,
} from "../controllers/projectsController.js";
import { isAuthenticated } from "../middleware/authentication.js";
import {
  loginLimit,
  createLimit,
  globalLimit,
  viewLimit,
} from "../middleware/limiter.js";

const router: express.Router = express.Router();

router.post("/api/login", loginLimit, login);
router.post("/api/logout", globalLimit, isAuthenticated, logout);
router.post("/api/createProject", createLimit, isAuthenticated, createRepo);
router.get("/api/projects", viewLimit, viewAllRepos);
router.get("/api/projects/:projectName", viewLimit, viewRepos);
router.get("/api/projects/:projectName/*splat", viewLimit, viewRepos);
router.get("/api/authenticate", globalLimit, isAuthenticated);
export default router;
