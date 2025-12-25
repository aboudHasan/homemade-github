import express from "express";
export const viewCommits = async (
  req: express.Request,
  res: express.Response
) => {
  const projectName = req.body.projectName;
};
