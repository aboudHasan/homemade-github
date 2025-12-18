import express from "express";
import { spawn } from "child_process";
import path from "path";
import { validatePath } from "../helpers/validator.js";
import fs from "fs/promises";

const tailscaleURL = process.env.TAILSCALE_URL;
const targetUser = process.env.TARGET_USER;

const createRepoScript = `set -e 
  PROJECT_NAME=$1
  TARGET_USER="${targetUser}"
  USER_HOME="/home/$TARGET_USER"
  GIT_FOLDER="$USER_HOME/git/$PROJECT_NAME.git"
  LIVE_FOLDER="$USER_HOME/projects/$PROJECT_NAME"

  if [ -z "$PROJECT_NAME" ]; then
      echo "Error: No project name provided."
      exit 1
  fi

  mkdir -p "$GIT_FOLDER"
  mkdir -p "$LIVE_FOLDER"

  git init --bare "$GIT_FOLDER"

  HOOK_FILE="$GIT_FOLDER/hooks/post-receive"
  echo "#!/bin/bash" > "$HOOK_FILE"
  echo "git --work-tree=$LIVE_FOLDER --git-dir=$GIT_FOLDER checkout -f" >> "$HOOK_FILE"
  chmod +x "$HOOK_FILE"
`;
const testScript = `
  PROJECT_NAME=$1
  echo "testing $PROJECT_NAME"
  exit 0
`;

export const createRepo = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { projectName } = req.body;

    if (!projectName || !/^[a-zA-Z0-9-_]+$/.test(projectName)) {
      return res.status(400).json({ error: "Invalid project name." });
    }

    const child = spawn("bash", ["-s", projectName]);
    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    child.stdin.write(testScript);
    child.stdin.end();

    child.on("close", (code) => {
      if (code !== 0) {
        console.error(`Failed: ${errorOutput}`);
        return res
          .status(500)
          .json({ error: "Creation failed", details: errorOutput });
      }
      console.log(output);

      const sshUrl = `${targetUser}@${tailscaleURL}:~/git/${projectName}.git`;

      return res.status(201).json({
        success: true,
        message: "Repository created.",
        gitUrl: sshUrl,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const viewRepos = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const projectName: string = req.params.projectName;
    const projectPath: string = req.params.splat
      ? Array.isArray(req.params.splat)
        ? req.params.splat.join("/")
        : req.params.splat
      : "";
    const fullPath: string = validatePath(projectName, projectPath);

    try {
      const project = await fs.stat(fullPath);

      if (project.isDirectory()) {
        const projectContents = await fs.readdir(fullPath, {
          withFileTypes: true,
        });

        const responseObject = await Promise.all(
          projectContents.map(async (item) => {
            const stats = await fs.stat(path.join(fullPath, item.name));

            return {
              name: item.name,
              type: item.isDirectory() ? "directory" : "file",
              size: item.isFile() ? stats.size : 0,
              modified: stats.mtime.toISOString(),
            };
          })
        );
        return res.json(responseObject);
      } else if (project.isFile()) {
        const fileContents = await fs.readFile(fullPath, "utf-8");
        const stats = await fs.stat(fullPath);
        return res.json({
          name: path.basename(fullPath),
          content: fileContents,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        });
      }
    } catch (error) {
      res.status(404).json({ message: "Couldn't find path" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server problem" });
  }
};

export const viewAllRepos = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const projectsFolder = `/home/${targetUser}/projects`;
    await fs.access(projectsFolder);

    const projectContents = await fs.readdir(projectsFolder, {
      withFileTypes: true,
    });

    const responseObject = await Promise.all(
      projectContents.map(async (item) => {
        const stats = await fs.stat(path.join(projectsFolder, item.name));

        return {
          name: item.name,
          type: item.isDirectory() ? "directory" : "file",
          size: item.isFile() ? stats.size : 0,
          modified: stats.mtime.toISOString(),
        };
      })
    );

    const onlyRepos = responseObject.filter(
      (item) => item.type === "directory"
    );

    res.json(onlyRepos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server problem" });
  }
};
