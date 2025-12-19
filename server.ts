import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/serverRouter.js";
import publicRouter from "./routes/publicRouter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 5000;
const app: express.Express = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", publicRouter);
app.use("/api", router);

app.listen(port, () => {
  console.log(`listening on port ${port}\nhttp://localhost:${port}`);
});
