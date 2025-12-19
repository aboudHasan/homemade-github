import express from "express";
import { pool } from "../db/connection.js";
import { type RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  session_token: string;
  timestamp: number;
}

export const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["session_token"];
    if (!sessionToken) {
      return res.redirect("/login");
    }

    const [rows] = await pool.execute<User[]>(
      "SELECT session_token, timestamp FROM users WHERE session_token = ?",
      [sessionToken]
    );

    if (rows.length === 0) {
      res.clearCookie("session_token");
      return res.redirect("/login");
    }

    const user = rows[0];
    if (Date.now() > user.timestamp) {
      res.clearCookie("session_token");
      return res.redirect("/login");
    }

    next();
  } catch (error) {
    console.log(error);
    return res.redirect("/login");
  }
};
