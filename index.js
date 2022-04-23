//Basic Configurations and Dependencies
const express = require('express');
const app = express();
const port = 3000;

//enable CORS from all sources
const cors = require('cors');
app.use(cors());

//send blank 1x1 gif as response to client
const blankgif = require('blankgif');
app.use(blankgif.middleware());

//Set up default mongoose connection and errorhandle it
const mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/ArvidAnalytics';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Define a MongoDB schema and create a Model from it (Model === Collection/Table in your MongoDB)
var Schema = mongoose.Schema;
var trackingRequestSchema = new Schema({
  page_name: String,
  page_language: String,
});
var trackingRequest = mongoose.model('tracking_request', trackingRequestSchema);

//tracking API endpoint that stores the QSP from tracking Request
app.get('/track', function (req, res) {
  // Create an instance of model (one Row in your MongoDB table/Collection)
  var tracking_instance = new trackingRequest({
    page_name: req.query.page_name,
    page_language: req.query.page_language,
  });

  // Save the new model instance, passing a callback
  tracking_instance.save(function (err) {
    if (err) return handleError(err);
    console.log(`saved ${tracking_instance}`);
  });

  //return a 1x1 gif as response to client
  res.set('Cache-Control', 'public, max-age=0');
  res.status(200).sendBlankGif();
});

//Analytics Dashboard API endpoint that displays all collected tracking-requests
app.get('/showCollectedData', (req, res) => {
  //processing API CAll
  trackingRequest.find({}, function (err, trackingRequests) {
    var trackingRequestMap = {};

    trackingRequests.forEach(function (trackingRequest) {
      trackingRequestMap[trackingRequest._id] = trackingRequest;
    });

    res.send(trackingRequestMap);
  });
});

//Starts the WebServer
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
