var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var AWS = require("aws-sdk");
const { initializeS3Middleware } = require("./middleware/s3"); // Require the s3Middleware.js file

var indexRouter = require("./routes/index");
var playersRouter = require("./routes/players");
var youtubeRouter = require("./routes/youtube");
var geoChartRouter = require("./routes/geochart");
var mapsKeyRouter = require("./routes/maps-key");
var pageCounterRouter = require("./routes/page-counter");
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

initializeS3Middleware(app);
app.use("/page-counter", pageCounterRouter);

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
