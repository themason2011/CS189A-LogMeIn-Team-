'use strict';

var Video = require('twilio-video');
var fs = require('fs');
/**
 * Display local video in the given HTMLVideoElement.
 * @param {HTMLVideoElement} video
 * @returns {Promise<void>}
 */
function displayLocalVideo(video) {
  return Video.createLocalVideoTrack().then(function(localTrack) {
    localTrack.attach(video);
  });
}

/**
 * Take snapshot of the local video from the HTMLVideoElement and render it
 * in the HTMLCanvasElement.
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
function takeLocalVideoSnapshot(video, canvas) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  console.log("tester");
  canvas.download = "test.png";
  canvas.toBlob(function(blob){
    canvas.href = URL.createObjectURL(blob);
    console.log(blob);
    console.log(canvas.href); // this line should be here
  },'image/png');
  canvas.click()
}

module.exports.displayLocalVideo = displayLocalVideo;
module.exports.takeLocalVideoSnapshot = takeLocalVideoSnapshot;
