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

router.post("/login", loginLimit, login);
router.post("/logout", globalLimit, isAuthenticated, logout);
router.post("/createProject", createLimit, isAuthenticated, createRepo);
router.get("/projects", viewLimit, viewAllRepos);
router.get("/projects/:projectName", viewLimit, viewRepos);
router.get("/projects/:projectName/*splat", viewLimit, viewRepos);
router.get(
  "/authenticate",
  globalLimit,
  isAuthenticated,
  (req: express.Request, res: express.Response) => {
    res.json({ success: true, message: "You're authenticated" });
  }
);
export default router;
