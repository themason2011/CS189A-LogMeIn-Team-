import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col, Button, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMehBlank,
  faGrinStars,
  faMeh,
  faTired,
  faFrownOpen,
  faSadTear,
  faLaughBeam,
  faAngry,
} from "@fortawesome/free-solid-svg-icons";

const DominantUser = ({ room }) => {
  const [videoTrackss, setVideoTrackss] = useState([]);
  const [audioTrackss, setAudioTrackss] = useState([]);
  const [emotion, setEmotion] = useState("-");
  const [emotion_style, setEmotion_Style] = useState("participant-video");
  const [dominant, setDominant] = useState(null);

  const videoref = useRef();
  const audioref = useRef();

  useEffect(() => {
    const ParticipantDominantSpeaker = (user) => {
      setDominant(user);
      console.log("new dominant speaker Dominant.js");
    };
    if (room !== null) {
      room.on("dominantSpeakerChanged", ParticipantDominantSpeaker);
    }
  }, [room]);

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    if (dominant != null) {
      setVideoTrackss(trackpubsToTracks(dominant.videoTracks));
      setAudioTrackss(trackpubsToTracks(dominant.audioTracks));
      const trackSubscribed = (track) => {
        if (track.kind === "video") {
          setVideoTrackss((videoTracks) => [...videoTracks, track]);
        }
        else if (track.kind === "audio") {
          setAudioTrackss((audioTracks) => [...audioTracks, track]);
        }
      };

      const trackUnsubscribed = (track) => {
        if (track.kind === "video") {
          setVideoTrackss((videoTracks) =>
            videoTracks.filter((v) => v !== track)
          );
        }
        else if (track.kind === "audio"){
          setAudioTrackss((audioTracks) => audioTracks.filter((v) => v !== track));
        }
      };

      dominant.on("trackSubscribed", trackSubscribed);
      dominant.on("trackUnsubscribed", trackUnsubscribed);

      return () => {
        setVideoTrackss([]);
        setAudioTrackss([]);
        dominant.removeAllListeners();
      };
    }
  }, [dominant]);

  const takeSnapshot = (videoElement) => {
    var imageCapture = new ImageCapture(videoElement);
    imageCapture
      .grabFrame()
      .then((bitmap) => {
        console.log("bitmap :", bitmap);
        let canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        let context = canvas.getContext("2d");

        context.drawImage(bitmap, 0, 0);
        canvas.toBlob(function (blob) {
          console.log(blob);
          var reader = new FileReader();
          reader.addEventListener("loadend", () => {
            fetch(reader.result)
              .then((res) => res.blob())
              .then((blob) => {
                console.log("here is your binary: ", blob);
                const fetchUrl =
                  "/video/snapShot?identity=" +
                  dominant.identity +
                  "&room=" +
                  room.name;
                fetch(fetchUrl, {
                  method: "POST",
                  body: blob,
                  headers: {
                    "Content-Type": "application/octet-stream",
                  },
                }).then(() => {
                  //Update the UI Sentiment to display the most up-to-date sentiment, according to backend
                  fetchVideoSentiment();
                });
              });
          });
          reader.readAsDataURL(blob);
        }, "image/jpeg");
      })
      .catch(function (error) {
        console.log("takePhoto() error: ", error);
      });
  };

  const fetchVideoSentiment = async () => {
    const getUrl =
      "/video/emotion?identity=" + dominant.identity + "&room=" + room.name;
    const data = await fetch(getUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    setEmotion(data);
  };

  const startRecording = (audioElement, lengthInMS) => {
    let recorder = new MediaRecorder(audioElement);
    let data = [];
 
     recorder.ondataavailable = event => data.push(event.data);
     recorder.start();
     console.log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
     let stopped = new Promise((resolve, reject) => {
       recorder.onstop = resolve;
       recorder.onerror = event => reject(event.name);
     });
 
     let recorded = wait(lengthInMS).then(
       () => recorder.state == "recording" && recorder.stop()
     );
 
     return Promise.all([
       stopped,
       recorded
     ])
     .then(() => data);
  };
 
  const recordAudio = (audioElement, lengthInMS) => {
    const MediaStreamer = new MediaStream();
    MediaStreamer.addTrack(audioElement);
    const recorder = new MediaRecorder(MediaStreamer);
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(() => startRecording(MediaStreamer, lengthInMS))
    .then(recordedChunks => {
      let recordedBlob = new Blob(recordedChunks, { type: "application/octet-stream" });

      console.log("Successfully recorded " + recordedBlob.size + " bytes of " + recordedBlob.type + " media.");
      console.log(recordedBlob);
      var reader = new FileReader();
      reader.addEventListener('loadend',() => {
        fetch(reader.result)
        .then(res => res.blob())
        .then(recordedBlob => {
          console.log("here is your binary: ", recordedBlob);
          const fetchUrl = '/audio/snapShot?identity=' + dominant.identity + '&room=' + room.name;
          fetch(fetchUrl, {
            method: 'POST',
            body: recordedBlob,
            headers: {
              'Content-Type':'application/octet-stream'
            }
          }).then(() => {
            //Update the UI Sentiment to display the most up-to-date sentiment, according to backend
            fetchVideoSentiment();
          });
        });
      });
      reader.readAsDataURL(recordedBlob);
    });
  };

  function wait(delayInMS) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
  }

  function stop(stream) {
    stream.getTracks().forEach(track => track.stop());
    console.log("Recording stopped");
  }

  //Takes a snapshot, which calls to backend API to update emotion, every time there is a change in who the Dominant User is AND every 2 seconds
  useEffect(() => {
    const videoSnapshotInterval = setInterval(() => {
      if (dominant != null) {
        const videoTrack = videoTrackss[0];
        if (videoTrack) {
          videoTrack.attach(videoref.current);
          takeSnapshot(videoTrack.mediaStreamTrack);
        }
      }
    }, 2000);
    return () => clearInterval(videoSnapshotInterval);
  }, [videoTrackss]);

  //Start a new audio recording interval and stop the old one for parsing every 6 seconds
  useEffect(() => {
    const intervalInMS = 8000;
    const audioSnapshotInterval = setInterval(() => {
      const intervalInMS = 8000;
      if(dominant != null){
        const audioTrack = audioTrackss[0];
        if (audioTrack) {
          audioTrack.attach(audioref.current);
          recordAudio(audioTrack.mediaStreamTrack, intervalInMS);
        }
      }
    }, intervalInMS);
    return () => {
      //TODO: VERIFY THAT stop(audioTrack) ACTUALLY STOPS THE RECORDING OF THE AUDIO TRACK AND RETURNS THE SENTIMENT ANAL OF THE PARTIALLY FININSHED RECORDING WHEN DOMINANT SPEAKER CHANGES
      if(dominant != null){
        stop(audioTrackss);
      }
      clearInterval(audioSnapshotInterval);
    }
  }, [audioTrackss]);

  //CAN BE UNCOMMENTED TO HAVE UI SENTIMENT REPEATEDLY FORCE REFRESH EVERY 1 SEC (DEBUG/TESTING).
  //Could also be used if we end up updating video and audio sentiment async, to ensure that the latest
  //sentiment is always being used.
  // useEffect(() => {
  //   const refreshSentimentInterval = setInterval(() => {
  //     fetchVideoSentiment();
  //   }, 1000);
  //   return () => clearInterval(refreshSentimentInterval);
  // }, [videoTrackss]);

  let emoji;
  let emotiontext;
  if (emotion.emotion === "happiness") {
    emoji = (
      // <img
      //   className="dominant-emotion-happy-img"
      //   src="https://img.icons8.com/color/48/000000/happy--v1.png"
      // />

      <FontAwesomeIcon
        className={"dominant-emotion-happy"}
        icon={faLaughBeam}
        size="2x"
      />
    );

    emotiontext = "HAPPY";
  } else if (emotion.emotion === "anger") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-angry"}
        icon={faAngry}
        size="2x"
      />
    );
    emotiontext = "ANGRY";
  } else if (emotion.emotion === "sadness") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-sadness"}
        icon={faSadTear}
        size="2x"
      />
    );
    emotiontext = "SADNESS";
  } else if (emotion.emotion === "fear") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-fear"}
        icon={faFrownOpen}
        size="2x"
      />
    );
    emotiontext = "FEAR";
  } else if (emotion.emotion === "disgust") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-disgust"}
        icon={faTired}
        size="2x"
      />
    );
    emotiontext = "DISGUST";
  } else if (emotion.emotion === "neutral") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-neutral"}
        icon={faMeh}
        size="2x"
      />
    );
    emotiontext = "NEUTRAL";
  } else if (emotion.emotion === "surprise") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-surprised"}
        icon={faGrinStars}
        size="2x"
      />
    );
    emotiontext = "SURPRISE";
  } else if (emotion.emotion === "-") {
    emoji = (
      <FontAwesomeIcon
        className={"dominant-emotion-undefined"}
        icon={faMehBlank}
        size="2x"
      />
    );
    emotiontext = "UNDEFINED";
  }

  return (
    <Row className="dominant-camera">
      {/* <span className="hoverclass"> */}
      {dominant ? (
        <video
          className={"participant-video-dominant"}
          width="100%"
          height="100%"
          ref={videoref}
          autoPlay={true}
        />
      ) : (
        <div className={"default-video-dominant"}></div>
      )}
      {/* {dominant ? <h3 className="dominant-name">{dominant.identity}</h3> : ""} */}
      {/* {emoji} */}
      {/* </span> */}

      <div className="dominant-border-emotion-icon">
        <h3 className="dominant-border-emotion-header">Emotion</h3>
        <div className="dominant-icon">{emoji}</div>
      </div>

      <div className="dominant-border">
        {dominant ? (
          <div className="dominant-border-name">{dominant.identity}</div>
        ) : (
          ""
        )}
        <div className="dominant-border-emotion-background">
          <div className="dominant-border-emotion-text">{emotiontext}</div>
        </div>
      </div>
    </Row>
  );
};

export default DominantUser;
