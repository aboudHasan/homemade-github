import crypto from "crypto";

const SECRET = process.env.SECRET;
const SALT = process.env.SALT;

export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (password: string) => {
  return crypto
    .createHmac("sha256", [password, SALT].join(""))
    .update(SECRET)
    .digest("hex");
};
