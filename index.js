require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const shortId = require("shortid");
const validUrl = require("valid-url");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
dotenv.config();
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});
const URL = mongoose.model("urldb", urlSchema);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint

app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;
  const id = shortId.generate();
  if (!validUrl.isWebUri(url)) {
    res.json({
      error: "invalid url",
    });
  } else {
    try {
      let exists = await URL.findOne({ original_url: url });
      const new_url = new URL({
        original_url: url,
        short_url: id,
      });
      if (!exists) {
        await new_url.save();
        res.json({
          original_url: url,
          short_url: id,
        });
      } else {
        res.json({
          original_url: url,
          short_url: id,
        });
      }
    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
});

app.get("/api/shorturl/:short_url?", async (req, res) => {
  try {
    const current_url = await URL.findOne({ short_url: req.params.short_url });
    if (current_url) {
      res.redirect(current_url.original_url);
    } else {
      res.status(404).json("NO URL found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT);
    console.log(`Listening on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});
