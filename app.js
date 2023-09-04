var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var AWS = require("aws-sdk");
require("dotenv").config();

var indexRouter = require("./routes/index");
var playersRouter = require("./routes/players");
var youtubeRouter = require("./routes/youtube");
var geoChartRouter = require("./routes/geochart");
var mapsKeyRouter = require("./routes/maps-key");
var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/players", playersRouter);
app.use("/youtube", youtubeRouter);
app.use("/geochart", geoChartRouter);
app.use("/maps-key", mapsKeyRouter);

// Initialize AWS S3 SDK

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  sessionToken: AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

const s3 = new AWS.S3();
let pageCounter = 0;
app.use(function (req, res, next) {
  pageCounter++;
  console.log(`Page counter: ${pageCounter}`);

  const params = {
    Bucket: "cab432-dems-nba-stats",
    Key: "page-counter.json", // Change the key to a .json file
    Body: JSON.stringify({ pageCounter }), // Convert to JSON string
  };
  s3.upload(params, function (err, data) {
    if (err) {
      console.error("Error uploading pageCounter:", err);
    } else {
      console.log("pageCounter uploaded successfully:", data.Location);
    }
  });
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  // Replace the following line that renders a view with JSON response
  // res.render("error");

  // Send a JSON response with error details
  res.json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
});

app.use(express.static("public"));
module.exports = app;
