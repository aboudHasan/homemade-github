import express from "express";
import { random, authentication } from "../helpers/auth.js";
import { pool } from "../db/connection.js";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;

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
      throw new Error("Login information incorrect");
    } else {
      const user = rows[0];
      if (!user || user.password === authentication(password)) {
        const token: string = random();
        await pool.execute<ResultSetHeader>(
          "UPDATE users SET session_token = ? WHERE username = ?",
          [token, username]
        );

        res.cookie("session_token", token, {
          httpOnly: true,
          secure: process.env.BUILD === "production",
          maxAge: 60 * 60 * 1000,
        });

        res.json({ message: "Logged in successfully" });
      } else {
        throw new Error("Login information incorrect");
      }
    }
  } catch (error: Error | any) {
    console.log(error);
    return res.status(400).json({ message: "Login information incorrect" });
  }
};
