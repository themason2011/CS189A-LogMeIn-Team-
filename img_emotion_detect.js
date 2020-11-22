'use strict';

const fs = require('fs');
const axios = require('axios');

// Add a valid subscription key and endpoint to your environment variables.
//NOTE: YOU MUST RUN THE FOLLOWING:
//set COGNITIVE_SERVICE_KEY='3f511205b82741fbbca3f0ea54cef7de'
//set COGNITIVE_SERVICE_ENDPOINT='https://juans-test.cognitiveservices.azure.com/'
// TO GET THE NEXT TO LINES TO WORK. WHEN WORKING WITH SERVER, JUST COPY THE KEYS IN HERE
var subscriptionKey = process.env['3f511205b82741fbbca3f0ea54cef7de']
var endpoint = process.env['https://juans-test.cognitiveservices.azure.com'] + '/face/v1.0/detect'

// Optionally, replace with your own image URL (for example a .jpg or .png URL).
let imageUrl = "https://docs.microsoft.com/en-us/learn/data-ai-cert/identify-faces-with-computer-vision/media/clo19_ubisoft_azure_068.png"

fs.readFile('/Users/juanmartinez/Downloads/cropped.jpg', (err, imageStream) => {
    if (err) throw err;
    
    // Send a POST request
    axios({
        method: 'post',
        url: endpoint,
        headers : {
            'Content-Type' : 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': subscriptionKey
        },
        params : {
            detectionModel: 'detection_01',
            returnFaceAttributes: 'emotion',
            returnFaceId: true
        },
        data: imageStream
    }).then(function (response) {
        // console.log('Status text: ' + response.status)
        // console.log('Status text: ' + response.statusText)
        // console.log()
        // console.log(response.data[0].faceAttributes.emotion)

        let prediction, max_val = 0;

        for(const [key, value] of Object.entries(response.data[0].faceAttributes.emotion)) {
            if(value > max_val) {
                max_val = value;
                prediction = key;
            }
        }

        console.log("The predicted emotion is: " + prediction);

    }).catch(function (error) {
        console.log(error)
    });
  });