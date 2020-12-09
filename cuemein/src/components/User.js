import React, { useState, useEffect, useRef } from "react";
// import {Container, Row, Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
const helpers = require('./helpers');
const muteYourAudio = helpers.muteYourAudio;
const unmuteYourAudio = helpers.unmuteYourAudio;

const User = ({ user, mute }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  // const [emotion, setEmotion] = useState(null);
  // const [emotion_style, setEmotion_Style] = useState("participant-video");


  const videoref = useRef();
  const audioref = useRef();

  console.log("User.js")

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)


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
  },[user]);

  // useEffect(() => {
  //   if(mute){
  //     console.log(mute,"mute")
  //     const publications = user.audioTracks;
  //     publications.forEach(function(publication){
  //       if(publication.track !== null){
  //         publication.track.disable();
  //       }
  //     });
  //   }
  //   console.log("mute useEffect() called");
  // },[mute]);


  useEffect(() => {

    const videoTrack = videoTracks[0];
    if (videoTrack) {
      console.log("User.js attach()")
      videoTrack.attach(videoref.current);
      return () => {
        console.log("User.js detach()")
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
    <div className="user-camera">
      <span className="hoverclass">
      <h3 className="participant-name">{user.identity}</h3>
      <video className={"participant-video"} height="120" ref={videoref} autoPlay={true}/>
      </span>
      {mute ? (
        <audio ref={audioref} autoPlay={true} muted/>
      ):(
        <audio ref={audioref} autoPlay={true}/>
      )}
    </div>
  );
};

export default User;