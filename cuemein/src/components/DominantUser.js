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
  const [emotion, setEmotion] = useState("-");
  const [emotion_style, setEmotion_Style] = useState("participant-video");
  const [dominant, setDominant] = useState(null);

  const videoref = useRef();

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

      const trackSubscribed = (track) => {
        if (track.kind === "video") {
          setVideoTrackss((videoTracks) => [...videoTracks, track]);
        }
      };

      const trackUnsubscribed = (track) => {
        if (track.kind === "video") {
          setVideoTrackss((videoTracks) =>
            videoTracks.filter((v) => v !== track)
          );
        }
      };

      dominant.on("trackSubscribed", trackSubscribed);
      dominant.on("trackUnsubscribed", trackUnsubscribed);

      return () => {
        setVideoTrackss([]);
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

  //Takes a snapshot, which calls to backend API to update emotion, every time there is a change in who the Dominant User is AND every 3 seconds
  useEffect(() => {
    const snapshotInterval = setInterval(() => {
      if (dominant != null) {
        const videoTrack = videoTrackss[0];
        if (videoTrack) {
          videoTrack.attach(videoref.current);
          takeSnapshot(videoTrack.mediaStreamTrack);

          return () => {
            // videoTrack.detach();
          };
        }
      }
    }, 2000);
    return () => clearInterval(snapshotInterval);
  }, [videoTrackss]);

  useEffect(() => {
    const videoTrack = videoTrackss[0];
    if (videoTrack) {
      console.log("User.js attach()");
      videoTrack.attach(videoref.current);
      return () => {
        console.log("User.js detach()");
        videoTrack.detach();
      };
    }
  }, [videoTrackss]);

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
  if (emotion.emotion === "happiness") {
    emoji = (
      <img
        className="dominant-emotion-happy-img"
        src="https://img.icons8.com/color/48/000000/happy--v1.png"
      />
    );
  } else if (emotion.emotion === "anger") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-angry"}
          icon={faAngry}
          size="2x"
        />
      </i>
    );
  } else if (emotion.emotion === "sadness") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-sadness"}
          icon={faSadTear}
          size="2x"
        />
      </i>
    );
  } else if (emotion.emotion === "fear") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-fear"}
          icon={faFrownOpen}
          size="2x"
        />
      </i>
    );
  } else if (emotion.emotion === "disgust") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-disgust"}
          icon={faTired}
          size="2x"
        />
      </i>
    );
  } else if (emotion.emotion === "neutral") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-neutral"}
          icon={faMeh}
          size="2x"
        />
      </i>
    );
  } else if (emotion.emotion === "surprise") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-surprised"}
          icon={faGrinStars}
          size="2x"
        />
      </i>
    );
  } else if (emotion.emotion === "-") {
    emoji = (
      <i>
        <FontAwesomeIcon
          className={"dominant-emotion-undefined"}
          icon={faMehBlank}
          size="2x"
        />
      </i>
    );
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

      {dominant ? (
        <div className="dominant-border">
          <div className="dominant-border-name">{dominant.identity}</div>
          {/* {dominant ? (
          <button
            type="button"
            className="btn btn-dominant btn-outline-info sentimentbtn"
            onClick={test}
          >
            What Am I Feeling?
          </button>
        ) : (
          ""
        )} */}
          <div className="dominant-border-emotion">
            <div className="dominant-border-emotion-background">
              <div className="dominant-border-emotion-icon">
                {/* <img
                  className="dominant-emotion-happy-img"
                  src="https://img.icons8.com/color/48/000000/happy--v1.png"
                /> */}
                {emoji}
              </div>
              <div className="dominant-border-emotion-text">Happy</div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </Row>
  );
};

export default DominantUser;
