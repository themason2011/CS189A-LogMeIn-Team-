import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row,Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTired,faFrownOpen,faSadTear, faLaughBeam,faAngry} from '@fortawesome/free-solid-svg-icons'


const DominantUser = ({ room }) => {
  const [videoTrackss, setVideoTrackss] = useState([]);
  const [emotion, setEmotion] = useState("-");
  const [emotion_style, setEmotion_Style] = useState("participant-video");
  const [dominant, setDominant] = useState(null);


  const videoref = useRef();

  useEffect(() => {
    const ParticipantDominantSpeaker = user => {
      setDominant(user);
      console.log("new dominant speaker Dominant.js") 
    }
    if(room!==null){
      room.on('dominantSpeakerChanged', ParticipantDominantSpeaker);
    }
  },[room]);

  const test = useCallback(
    async event => {
      event.preventDefault();
      const data = await fetch('/video/emotion', {
        method: 'POST',
        body:JSON.stringify({
          identity:dominant.identity
        }),
        headers: {
          'Content-Type':'application/json'
        }
      }).then(res => res.json());

      // if(data.emotion === 'happiness'){
      //   setEmotion_Style('participant-video-happy');
      // }
      // else if(data.emotion === 'anger'){
      //   setEmotion_Style('participant-video-angry');
      // }
      // else if(data.emotion === 'sadness'){
      //   setEmotion_Style('participant-video-sad');
      // }
      // else if(data.emotion === 'fear'){
      //   setEmotion_Style('pariticipant-video-fear')
      // }
      // else if(data.emotion === 'disgust'){
      //   setEmotion_Style('participant-video-disgust')
      // }
      setEmotion(data);
    },[dominant]);

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    if( dominant != null){
      setVideoTrackss(trackpubsToTracks(dominant.videoTracks));

      const trackSubscribed = (track) => {
       if (track.kind === "video") {
          setVideoTrackss((videoTracks) => [...videoTracks, track]);
        }
      };

      const trackUnsubscribed = (track) => {
       if (track.kind === "video") {
          setVideoTrackss((videoTracks) => videoTracks.filter((v) => v !== track));
        }
      };

     dominant.on("trackSubscribed", trackSubscribed);
     dominant.on("trackUnsubscribed", trackUnsubscribed);

      return () => {
        setVideoTrackss([]);
        dominant.removeAllListeners();
      };
    }
    }, [dominant ]);

  useEffect(() => {
    if(dominant != null){
      const videoTrack = videoTrackss[0];
      if (videoTrack) {
        videoTrack.attach(videoref.current);
        console.log("attach() Dominant.js");
        return () => {
          console.log("detach() Dominant.js");
          // videoTrack.detach();
        };
      }
    }
  }, [videoTrackss]);


  let emoji;
  if (emotion.emotion === "happiness"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-happy"} icon={faLaughBeam} size='2x'/></i>
  } else if (emotion.emotion === "angry"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-angry"} icon={faAngry} size='2x'/></i>
  } else if (emotion.emotion === "sadness"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-sadness"} icon ={faSadTear} size='2x'/></i>
  } else if (emotion.emotion === "fear"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-fear"} icon={faFrownOpen} size='2x'/></i>
  } else if (emotion.emotion === "disgust"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-disgust"} icon = {faTired} size = '2x'/></i>
  }

  return (
    <Col className="i" fluid="true" md={9} style={{position:'relative'}}>
      <Row className="dominant-camera">
        <span className="hoverclass">
        {dominant ? (
        <video className={"participant-video-dominant"} height="100%" ref={videoref} autoPlay={true} />
        ) : (
          ''
        )
        }
        {dominant ? (
        <h3 className="dominant-name">{dominant.identity}</h3>
        ) : (
          ''
        )
        }
          {emoji}
        </span>
        <div className = "col-md-auto">
        {dominant ? (
          <button type="button" className="btn btn-outline-info sentimentbtn" onClick={test}>Sentiment Analysis</button>
          ) : (
            ''
          )
        }
        </div>

      </Row>

    </Col>
  );
};

export default DominantUser;