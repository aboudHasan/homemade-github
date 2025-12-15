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
      session_token?: string;
    }

    const hash = authentication(password);
    pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ? AND password"
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
