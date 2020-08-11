const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const morgan = require("morgan");

const movie = require("./routes/movie");
const user = require("./routes/user");
const favorite = require("./routes/favorite");

const app = express();

app.use(express.json());

app.use(morgan("combined"));

app.use("/api/v1/movie", movie);
app.use("/api/v1/user", user);
app.use("/api/v1/favorite", favorite);

const PORT = process.env.PORT || 5400;

app.get("/", (req, res, next) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("App listening on port 5400!");
});
