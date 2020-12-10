const speech = require('@google-cloud/speech');
const language = require('@google-cloud/language');
const fs = require('fs');

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');



async function main() {
    //Set up Google Speech to Text Client
    const client = new speech.SpeechClient();
    const client2 = new language.LanguageServiceClient();

    //Audio Input
    const filename = './trump.wav';

    //Set up Watson Sentiment Analysis Client
    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2020-08-01',
        authenticator: new IamAuthenticator({
          apikey: 'hJ9YKWBxjhZUkfNXai4YOKY2dvvPsX7pHjoDe1fRbdZI',
        }),
        serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/33ac35e7-3474-4ad4-a93e-d784322b8324',
      });


    //Read input file / encode
    const file = fs.readFileSync(filename);
    const audioBytes = file.toString('base64');

    const audio = {
        content: audioBytes
    };

    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        audioChannelCount: 2

    };

    // const config = {
    //     encoding: 'MP3',
    //     sampleRateHertz:48000,
    //     languageCode: 'en-US'
    // };

    const request = {
        audio: audio,
        config: config
    };

    //Google Speech to text request - Transcription = Speech to text
    const[response] = await client.recognize(request);

    const transcription = response.results.map(result => 
        result.alternatives[0].transcript).join('\n');
        console.log(`Transcription: ${transcription} `);

    // const document = {
    //     content: transcription,
    //     type: 'PLAIN_TEXT',
    //     };


    const analyzeParams = {
        'text': transcription,
        'features': {
            'emotion': {   
            }
        }
    };

    //Watson Sentiment Analysis Request and Output
    naturalLanguageUnderstanding.analyze(analyzeParams)
    .then(analysisResults => {
    console.log(JSON.stringify(analysisResults, null, 2));
     })
     .catch(err => {
     console.log('error:', err);
     });

    //const [result] = await client2.analyzeSentiment({document});

    // const sentiment = result.documentSentiment;
    // console.log('Document sentiment:');
    // console.log(`  Score: ${sentiment.score}`);
    // console.log(`  Magnitude: ${sentiment.magnitude}`);
    
    // const sentences = result.sentences;
    // sentences.forEach(sentence => {
    //   console.log(`Sentence: ${sentence.text.content}`);
    //   console.log(`  Score: ${sentence.sentiment.score}`);
    //   console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
    // });
    }
    main().catch(console.error);
