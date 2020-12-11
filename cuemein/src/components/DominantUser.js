import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row,Col, Button,Container} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGrinStars,faMeh,faTired,faFrownOpen,faSadTear, faLaughBeam,faAngry} from '@fortawesome/free-solid-svg-icons'


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
      //takeSnapshot(videoTrackss[0]);
      const data1 = await fetch('/video/token?identity=tester&room=cool', {
        method: 'GET',
        headers: {
          'Content-Type':'application/json'
        }
      }).then(res => res.json());
      const data = await fetch('/video/emotion', {
        method: 'POST',
        body:JSON.stringify({
          identity:dominant.identity
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
        setEmotion_Style('participant-video-sad');
      }
      else if(data.emotion === 'fear'){
        setEmotion_Style('pariticipant-video-fear')
      }
      else if(data.emotion === 'disgust'){
        setEmotion_Style('participant-video-disgust')
      }
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
  
  const takeSnapshot = (videoElement) => {
    
    var imageCapture = new ImageCapture(videoElement);
    imageCapture.grabFrame().then(bitmap => {
      console.log('bitmap :', bitmap)
      let canvas = document.createElement('canvas')
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      let context = canvas.getContext('2d')
      
      context.drawImage(bitmap, 0, 0)
      canvas.toBlob(function(blob) {
        console.log(blob);
        var reader = new FileReader();
        reader.addEventListener('loadend',() => {
          
          fetch(reader.result)
          .then(res => res.blob())
          .then(blob => {
          console.log("here is your binary: ", blob)
          fetch('/video/snapShot?identity='+dominant.identity+'&room=cool', {
            method: 'POST',
            body: blob,
            headers: {
              'Content-Type':'application/octet-stream'
            }
          });  
          });

        });
        reader.readAsDataURL(blob);
      }, 'image/jpeg')
    }).catch(function(error) {
      console.log('takePhoto() error: ', error);
    }); 
  }
  useEffect(() => {
    if(dominant != null){
      const videoTrack = videoTrackss[0];
      if (videoTrack) {
        videoTrack.attach(videoref.current);
        //add delay 
        takeSnapshot(videoTrack.mediaStreamTrack);
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
  } else if (emotion.emotion === "anger"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-angry"} icon={faAngry} size='2x'/></i>
  } else if (emotion.emotion === "sadness"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-sadness"} icon ={faSadTear} size='2x'/></i>
  } else if (emotion.emotion === "fear"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-fear"} icon={faFrownOpen} size='2x'/></i>
  } else if (emotion.emotion === "disgust"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-disgust"} icon = {faTired} size = '2x'/></i>
  } else if (emotion.emotion === "neutral"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-neutral"} icon = {faMeh} size = '2x'/></i>
  } else if(emotion.emotion ==="surprise"){
    emoji = <i><FontAwesomeIcon className={"dominant-emotion-neutral"} icon = {faGrinStars} size = '2x'/></i>
  } 

  return (
    <Col className="i" fluid="true" md={9} style={{position:'relative'}}>
      <Row className="dominant-camera">
        <span className="hoverclass">
        {dominant ? (
        <video className={"participant-video-dominant"} height="100%" ref={videoref} autoPlay={true} />
        ) : (
          <Container className={"default-video-dominant"}></Container>
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

        {dominant ? (
          <button type="button" className="btn btn-outline-info sentimentbtn" onClick={test}>What Am I Feeling?</button>
          ) : (
            ''
          )
        }
     

      </Row>

    </Col>
  );
};

export default DominantUser;