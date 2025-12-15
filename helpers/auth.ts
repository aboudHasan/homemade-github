import crypto from "crypto";

const SALT = process.env.SALT;

export const random = () => crypto.randomBytes(32).toString("base64");
export const authentication = (password: string) => {
  return crypto
    .createHash("sha256")
    .update(password + SALT)
    .digest("hex");
};
