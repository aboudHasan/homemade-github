import express from "express";
import { pool } from "../db/connection.js";
import { type RowDataPacket } from "mysql2";

interface CountResult extends RowDataPacket {
  count: number;
}

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["session_token"];
    if (!sessionToken) {
      return res.status(401).json({ message: "Missing session token" });
    }

    const [rows] = await pool.execute<CountResult[]>(
      "SELECT COUNT(*) as count FROM users WHERE session_token = ?",
      [sessionToken]
    );

    const userCount = rows[0].count;

    if (userCount === 0) {
      res.clearCookie("session_token");
      return res.status(400).json({ message: "Failed to authenticate" });
    }

    return next();
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};
