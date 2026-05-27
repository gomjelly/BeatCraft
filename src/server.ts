import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/status", (_, res) => {
  res.json({ status: "ok", message: "BeatCraft server is running." });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
