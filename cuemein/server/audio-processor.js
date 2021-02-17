const fs = require("fs");

const SpeechToTextV1 = require("ibm-watson/speech-to-text/v1");

const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

async function ProcessAudio(blob_data) {
  // console.log("Got to audio processor");
  // console.log(blob_data);
  //Audio Input
  //const filename = "./trump.wav";

  //Set up Watson Sentiment Analysis Client
  const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: "2020-08-01",
    authenticator: new IamAuthenticator({
      apikey: "hJ9YKWBxjhZUkfNXai4YOKY2dvvPsX7pHjoDe1fRbdZI",
    }),
    serviceUrl:
      "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/33ac35e7-3474-4ad4-a93e-d784322b8324",
  });

  //Set Up Watson Speech to Text Client
  const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: "hbnXY943Ap_XdulJxk1P0s2QRNtbbT0mxWFx6m5YQQ5u",
    }),
    serviceUrl:
      "https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/f305cf07-f559-495a-b5fa-8c27fda0393e",
  });

  //  const registerCallbackParams = {
  //       callbackUrl: 'https://stream.watsonplatform.net/speech-to-text/api/v1',
  //       userSecret: 'ThisIsMySecret',
  //     };

  // speechToText.registerCallback(registerCallbackParams)
  //       .then(registerStatus => {
  //         console.log(JSON.stringify(registerStatus, null, 2));
  //       })
  //       .catch(err => {
  //         console.log('error:', err);
  //       });

  //Set Up Parameters for Audio Input
  const recognizeParams = {
    audio: blob_data,
    contentType: "application/octet-stream",
  };

  //Speech To Text API Call
  return speechToText
    .recognize(recognizeParams)
    .then((speechRecognitionResults) => {
      //Output Transcript
      console.log(
        "Transcription: " +
        JSON.stringify(
          speechRecognitionResults.result.results[0].alternatives[0].transcript,
          null,
          2
        )
      );
      //Setup Parameters For Sentiment Analysis
      const analyzeParams = {
        text:
          speechRecognitionResults.result.results[0].alternatives[0].transcript,
        features: {
          emotion: {},
        },
      };
      //Sentiment Analysis API Call
      return naturalLanguageUnderstanding
        .analyze(analyzeParams)
        .then((analysisResults) => {
          //Output Five Different Emotion Scores
          console.log(
            "Emotion Scores: " +
            JSON.stringify(
              analysisResults.result.emotion.document.emotion,
              null,
              2
            )
          );

          let prediction, max_val = 0;

            for(const [key, value] of Object.entries(analysisResults.result.emotion.document.emotion)) {
                if(value > max_val) {
                    max_val = value;
                    prediction = key;
                }
            }

            if(prediction == "joy")    {
              prediction = "happiness";
            }

            console.log("Here is the audio sentiment's prediction: ");
            console.log(prediction);
            return prediction;


        })
        .catch((err) => {
          console.log("error:", err);
        });
    })
    .catch((err) => {
      console.log("error:", err);
    });
}

module.exports = { ProcessAudio };
