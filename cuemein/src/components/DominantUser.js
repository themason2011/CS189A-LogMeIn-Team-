import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row,Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const DominantUser = ({ user }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [emotion, setEmotion] = useState("-");
  const [emotion_style, setEmotion_Style] = useState("participant-video");


  const videoref = useRef();
  const audioref = useRef();

  const test = useCallback(
    async event => {
      event.preventDefault();
      const data = await fetch('/video/emotion', {
        method: 'POST',
        body:JSON.stringify({
          identity:user
        }),
        headers: {
          'Content-Type':'application/json'
        }
      }).then(res => res.json());
      if(data.emotion === 'happy'){
        setEmotion_Style('participant-video-happy');
      }
      else if(data.emotion === 'angry'){
        setEmotion_Style('participant-video-angry');
      }
      else if(data.emotion === 'sad'){
        setEmotion_Style('participant=video-sad');
      }
      setEmotion(data);
    },[user]);

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    setVideoTracks(trackpubsToTracks(user.videoTracks));
    setAudioTracks(trackpubsToTracks(user.audioTracks));

    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      }
    };

    user.on("trackSubscribed", trackSubscribed);
    user.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      user.removeAllListeners();
    };
  }, [user]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoref.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioref.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <Col >
      <Row className="dominant-camera">
      <span className="hoverclass">
      <video className={emotion_style} height="100%" ref={videoref} autoPlay={true} />
      <h3 className="dominant-name">{user.identity}</h3>
      <h2 className={"dominant-emotion"+emotion.emotion}>{emotion.emotion}</h2>
      </span>
      <audio ref={audioref} autoPlay={true} muted/>
      </Row>
      <div class="container">
        <div class="row justify-content-md-center">
          <div class = "col-md-auto">
            <button type="button" class="btn btn-outline-info" onClick={test}>Sentiment Analysis</button>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default DominantUser;