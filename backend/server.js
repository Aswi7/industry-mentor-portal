const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Industry Mentor Portal Backend running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
