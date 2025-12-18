import path from "path";

export const validatePath = (
  projectName: string,
  subPath: string = ""
): string | null => {
  const targetUser = process.env.TARGET_USER;
  if (!targetUser) {
    console.log("no user in environment variable");
    return null;
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
    console.warn(`Invalid project name: ${projectName}`);
    return null;
  }

  const projectsFolder: string = `/home/${targetUser}/projects`;
  const projectDirectory: string = path.join(projectsFolder, projectName);
  const fullPath: string = path.join(projectDirectory, subPath);

  const resolvedPath = path.resolve(fullPath);
  const resolvedProjectPath = path.resolve(projectsFolder);
  if (!resolvedPath.startsWith(resolvedProjectPath)) {
    console.warn(`Path traversal attempt detected: ${subPath}`);
    return null;
  }

  return resolvedPath;
};
