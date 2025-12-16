import express from "express";
import { random, authentication } from "../helpers/crypto.js";
import { pool } from "../db/connection.js";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Missing username and/or password" });
    }
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
      return res.sendStatus(400);
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
    } else {
      const user = rows[0];
      if (!user || user.password === authentication(password)) {
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

        res.json({ message: "Logged in successfully" });
      } else {
        return res.status(400).json({ message: "Login information incorrect" });
      }
    }
  } catch (error: Error | any) {
    console.log(error);
    return res.status(400).json({ message: "Login information incorrect" });
  }
};
