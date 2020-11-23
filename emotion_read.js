'use strict';

const fs = require('fs');
const axios = require('axios').default;

function ProcessImage(image)    {
    // Add a valid subscription key and endpoint to your environment variables.
    //NOTE: YOU MUST RUN THE FOLLOWING:
    const fs = require('fs');
    const axios = require('axios').default;
    const subscriptionKey='3f511205b82741fbbca3f0ea54cef7de';
    const endpoint='https://juans-test.cognitiveservices.azure.com/face/v1.0/detect';
    // TO GET THE NEXT TO LINES TO WORK. WHEN WORKING WITH SERVER, JUST COPY THE KEYS IN HERE
    // let subscriptionKey = process.env['COGNITIVE_SERVICE_KEY']
    // let endpoint = process.env['COGNITIVE_SERVICE_ENDPOINT'] + '/face/v1.0/detect'

    // Optionally, replace with your own image URL (for example a .jpg or .png URL).
    let imageUrl = "https://docs.microsoft.com/en-us/learn/data-ai-cert/identify-faces-with-computer-vision/media/clo19_ubisoft_azure_068.png"

    //const imageBuffer = fs.readFileSync('testing.png');
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
        body: image,
        headers: {
            'Content-Type': 'application/javascript',
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
}

module.exports = { ProcessImage };