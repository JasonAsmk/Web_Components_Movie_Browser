const express = require("express");
const path = require("path");

const app = express();

app.use("/dist", express.static(path.resolve(__dirname, "dist")));

app.use("/src", express.static(path.resolve(__dirname, "src")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.resolve(__dirname, "dist", "static", '404.html'));
});

app.listen(process.env.PORT || 4005, () => console.log("server running on port ${process.env.PORT || 4005}"))
