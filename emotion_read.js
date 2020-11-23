'use strict';

const request = require('request');
const fs = require('fs');
// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = '3f511205b82741fbbca3f0ea54cef7de';

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriBase = 'https://juans-test.cognitiveservices.azure.com/face/v1.0/detect';
//'https://westus.api.cognitive.microsoft.com/face/v1.0/detect';

// const imageUrl =
// 'http://localhost:3000/d39b057a-bd7d-4471-a6c4-2a8e2b4a09d8';
const imageBuffer = fs.readFileSync('testing.png');
// Request parameters.
const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
        'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
};

const options = {
    uri: uriBase,
    qs: params,
    body: imageBuffer,
    headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};

request.post(options, (error, response, body) => {
  if (error) {
    console.log('Error: ', error);
    return;
  }
  let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
  console.log('JSON Response\n');
  console.log(jsonResponse);
});