const speech = require('@google-cloud/speech');
const language = require('@google-cloud/language');
const fs = require('fs');

async function main() {
    const client = new speech.SpeechClient();
    const client2 = new language.LanguageServiceClient();
    const filename = '../resources/trump.wav';

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

    const[response] = await client.recognize(request);

    const transcription = response.results.map(result => 
        result.alternatives[0].transcript).join('\n');
        console.log(`Transcription: ${transcription} `);

    const document = {
        content: transcription,
        type: 'PLAIN_TEXT',
        };

    const [result] = await client2.analyzeSentiment({document});

    const sentiment = result.documentSentiment;
    console.log('Document sentiment:');
    console.log(`  Score: ${sentiment.score}`);
    console.log(`  Magnitude: ${sentiment.magnitude}`);
    
    const sentences = result.sentences;
    sentences.forEach(sentence => {
      console.log(`Sentence: ${sentence.text.content}`);
      console.log(`  Score: ${sentence.sentiment.score}`);
      console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
    });
    }
    main().catch(console.error);
