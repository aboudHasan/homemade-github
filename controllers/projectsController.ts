import express from "express";
import { spawn } from "child_process";

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
};
