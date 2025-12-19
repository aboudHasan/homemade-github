import express from "express";
import { random, authentication, verifyPassword } from "../helpers/crypto.js";
import { pool } from "../db/connection.js";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { verify } from "node:crypto";

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.cookies.session_token) {
      return res.status(400).json({ message: "Failed to logout" });
    }
    const token: string = req.cookies.session_token;
    await pool.execute<ResultSetHeader>(
      "UPDATE users SET session_token = NULL, timestamp = NULL WHERE session_token = ?",
      [token]
    );
    res.clearCookie("session_token");
    res.json({ message: "Successfully logged out" });
  } catch (error: Error | any) {
    console.log(error);
    return res.status(400).json({ message: "failed to logout" });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Missing username and/or password" });
    }
    const username: string = req.body.username;
    const password: string = req.body.password;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Missing username and/or password" });
    }

    interface User extends RowDataPacket {
      id: number;
      username: string;
      password: string;
    }

    const [rows] = await pool.execute<User[]>(
      "SELECT id, username, password FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Login information incorrect" });
    }

    const user: User = rows[0];
    if (!user) {
      return res.status(400).json({ message: "Login information incorrect" });
    }

    const isValid: boolean = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Login information incorrect" });
    }

    const token: string = random();
    const timestamp = Date.now() + 60 * 60 * 1000;
    await pool.execute<ResultSetHeader>(
      "UPDATE users SET session_token = ?, timestamp = ? WHERE username = ?",
      [token, timestamp, username]
    );

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.BUILD === "production",
      maxAge: 60 * 60 * 1000,
    });

    res.json({
      message: "Logged in successfully",
      username: req.body.username,
    });
  } catch (error: Error | any) {
    console.log(error);
    return res.status(400).json({ message: "Login information incorrect" });
  }
};
