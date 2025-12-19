import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/pageAuthenticator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicRouter: express.Router = express.Router();

publicRouter.get("/", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

publicRouter.get("/login", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

publicRouter.get("/projects", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "../public/projects.html"));
});

publicRouter.get(
  "/create-project",
  requireAuth,
  (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, "../public/create-project.html"));
  }
);

export default publicRouter;
