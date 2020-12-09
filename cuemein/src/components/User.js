import React, { useState, useEffect, useRef } from "react";
// import {Container, Row, Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faMicrophoneSlash} from '@fortawesome/free-solid-svg-icons'


const helpers = require('./helpers');
const muteYourAudio = helpers.muteYourAudio;
const unmuteYourAudio = helpers.unmuteYourAudio;


const User = ({ user, mute }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [muted, setMute] = useState(false);
  const [vmute, setVmute] = useState(false);
  // const [emotion, setEmotion] = useState(null);
  // const [emotion_style, setEmotion_Style] = useState("participant-video");


  const videoref = useRef();
  const audioref = useRef();

  console.log("User.js")

  const toggleMute = (muted) => {
    setMute(muted);
    console.log("toggle mute",muted);
  }

  const toggleVmute = (muted) => {
    console.log("toggleVmute",muted);
    setVmute(muted);
  }


  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)


  useEffect(() => {


    setVideoTracks(trackpubsToTracks(user.videoTracks));
    setAudioTracks(trackpubsToTracks(user.audioTracks));

      user.videoTracks.forEach(track => {
        track.on("trackEnabled",toggleVmute.bind(this,false));
        track.on("trackDisabled",toggleVmute.bind(this,true));
      });

      user.audioTracks.forEach(track => {
        track.on("trackEnabled",toggleMute.bind(this,false));
        track.on("trackDisabled",toggleMute.bind(this,true));
      });

    const trackSubscribed = (track) => {
      console.log(track, "track subs");
      if (track.kind === "video") {
        setVmute(!track.isEnabled);
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setMute(!track.isEnabled);
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
      {muted ? (
        <i><FontAwesomeIcon className={"muted"} icon={faMicrophoneSlash} size='2x'/></i>
      ):(
        ''
      )}
      <span className="hoverclass">
      <h3 className="participant-name">{user.identity}</h3>
      {vmute ? (
        <video height="120"></video>
      ):(
        <video className={"participant-video"} height="120" ref={videoref} autoPlay={true}/>
      )}
      </span>
      {mute ? (
        <audio ref={audioref} autoPlay={true} muted/>
      ):(
        <audio ref={audioref} autoPlay={true} muted/>
      )}
    </div>
  );
};

export default User;