import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row,Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSmile, faLaughBeam,faAngry} from '@fortawesome/free-solid-svg-icons'


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
          identity:user.identity
        }),
        headers: {
          'Content-Type':'application/json'
        }
      }).then(res => res.json());
      if(data.emotion === 'happiness'){
        setEmotion_Style('participant-video-happy');
      }
      else if(data.emotion === 'anger'){
        setEmotion_Style('participant-video-angry');
      }
      else if(data.emotion === 'sadness'){
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

  let emoji;
  if (emotion.emotion === "happy"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-happy"} icon={faLaughBeam} size='2x'/></i>
  } else if (emotion.emotion === "angry"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-angry"} icon={faAngry} size='2x'/></i>
  } 

  return (
    <Col className="i" fluid="true" md={9} style={{position:'relative'}}>
      <Row className="dominant-camera">
        <span className="hoverclass">
        <video className={"participant-video-dominant"} height="100%" ref={videoref} autoPlay={true} />
        <h3 className="dominant-name">{user.identity}</h3>
          {emoji}
        </span>
        <audio ref={audioref} autoPlay={true} muted/>
        <div className = "col-md-auto">
          <button type="button" className="btn btn-outline-info sentimentbtn" onClick={test}>Sentiment Analysis</button>
        </div>

      </Row>

    </Col>
  );
};

export default DominantUser;