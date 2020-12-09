import React, { useState, useEffect, useCallback } from 'react';
import Video from 'twilio-video';
import User from './User';
import DominantUser from './DominantUser';
import {Container, Row, Col, Button, Navbar, Nav} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faDesktop, faVideo, faHeadphones } from '@fortawesome/free-solid-svg-icons'
import { UserBindingContext } from 'twilio/lib/rest/chat/v2/service/user/userBinding';

const helpers = require('./helpers');
const muteYourAudio = helpers.muteYourAudio;
const unmuteYourAudio = helpers.unmuteYourAudio;


const Room = ({ meetingname, token,emotion,logout, test}) => {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState([]);
  const [newDomName, setNewDomName] = useState("");
  const [mute, setMute] = useState(false);
  const [videomute,setVideomute] = useState(false);
  const [deafenmute, setDeafenmute] = useState(false);
  console.log("Room.js render");
 


  useEffect(() => {
    console.log("dominant speacjer Room.js effect")
    const participantConnected = user => {
      console.log("Room.js - particiapnt connected",user);
      setUser(prevusers => [...prevusers, user]);
    };

    const participantDisconnected = user => {
      console.log("Room.js - particiapnt disconnected",user);
      setUser(prevusers => prevusers.filter(p => p !== user));
    };


    const ParticipantNewDominantSpeaker = user => {
      if(user !== null){
        console.log("dominant speacjjer Room.js");
        setNewDomName(user.identity);
      }
      else if(user===null){
        console.log("dominant speacker Room.js");
        setNewDomName(null);
      }
    }

    const participantRemoteVideoMuted = (track,user) => {
      console.log("Room.js - Track disable",track,user);
    }

    const participantRemotedAudioMuted = (track,user)  => {

    }

    Video.connect(token, {
      name: meetingname,
      dominantSpeaker:true,
      audio:true,
      video:true,
    }).then(room => {
        console.log("Room.js - line 59 - video.connect", room);
        setRoom(room);
        room.on('participantConnected', participantConnected);
        room.on('participantDisconnected', participantDisconnected);
        room.on('dominantSpeakerChanged', ParticipantNewDominantSpeaker);
        room.on('trackDisabled', participantRemoteVideoMuted);
        room.participants.forEach(participantConnected);
        console.log("testing - line 61!!!!!!",room);
    });

    return () => {
         setRoom(currentRoom => {

          console.log("testing - line 65!!!!!!",currentRoom);
          if(currentRoom && currentRoom.localParticipant.state === 'connected') {
            currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          console.log("disconnect!!!!!!");
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
         });
    };
  }, [meetingname, token]);


  const mutecallback = useCallback(() => {
    console.log("called mutecallback, button pressed")
      if(mute === false && room !== null){
        muteYourAudio(room);
        setMute(true);
      }
      else if(mute === true && room !== null){
        unmuteYourAudio(room);
        setMute(false);
      }
    },[mute,room]
  );

  const mutevideocallback = useCallback(() => {
    console.log("called mutevideocallback, button pressed")
      if(videomute === false && room !== null){
        helpers.muteYourVideo(room);
        setVideomute(true);
      }
      else if(videomute === true && room !== null){
        helpers.unmuteYourVideo(room);
        setVideomute(false);
      }
    },[videomute,room]
  );

  const defeancallback = useCallback(() => {
    console.log("called deafencallback, button pressed");
    if(deafenmute === false && room !==null){
      muteYourAudio(room);
      setDeafenmute(true);
    }
    else if(deafenmute === true && room !=null){
      unmuteYourAudio(room);
      setDeafenmute(false);
    }
  },[room,deafenmute]);

  const logoutcallback = useCallback(() => {
      console.log("testing - line 125!!!!!!",room);
      if(room && room.localParticipant.state === 'connected') {
        room.localParticipant.tracks.forEach(function(trackPublication) {
        trackPublication.track.stop();
      });
      console.log("Room.js disconnect!!!!!! - line 132");
      room.disconnect();
    }
    logout();
    
  },[room]);

  const remoteParticipants = user.map((user,index) => (
    <Col key={"remote-participants"+ index} className="remote-participants-camera">
        <User 
        key={index} 
        user={user} 
        mute={deafenmute} 
        />
    </Col>
  ));


  
  return (
    <div className="room">
      <Nav className="navbar navbar-inverse">
        <div className="container-fluid">
          <Nav.Item className="mr-auto">
            <Navbar.Brand>Talking: {newDomName}</Navbar.Brand>
          </Nav.Item>
          <Nav.Item className="mx-auto">
            <Navbar.Brand>Room Name: {meetingname}</Navbar.Brand>
          </Nav.Item>
          <Nav.Item className="ml-auto">
            <Button variant="danger" onClick={logoutcallback}>LOG OUT</Button>
          </Nav.Item>       
        </div>
        </Nav>
      <Container className="cameras" fluid="true">
        <Row className="participants">
          <Col xs="auto" className="local-participant">
            {room ? (
              <div className="local-participant-camera">
                <User
                  key={room.localParticipant.sid}
                  user={room.localParticipant}
                  mute={deafenmute}
                />
              </div>
            ) : (
              ''
            )}
          </Col>
          <Col xs="auto" className="remote-participants">
            <Row>
                {remoteParticipants}
            </Row>
          </Col>
        </Row>
      </Container>
      <Container fluid="true">
        <Row className="dominant">
                <DominantUser
                key={"dominant"}
                room={room}
              />
        <Col sm={2} >
        <Row>
          <Button type="button" className="btn btn-info btn-circle btn-xl" onClick = {mutecallback}><FontAwesomeIcon icon={faMicrophone} /></Button>
          </Row>
          <Row>
          <Button type="button" className="btn btn-info btn-circle btn-xl" onClick = {mutevideocallback}><FontAwesomeIcon icon={faVideo} /></Button>
          </Row>
          <Row>
          <Button type="button" className="btn btn-info btn-circle btn-xl" onClick = {defeancallback}><FontAwesomeIcon icon={faHeadphones} /></Button>
          </Row>
          <Row>
          <Button type="button" className="btn btn-info btn-circle btn-xl"><FontAwesomeIcon icon={faDesktop} /></Button>
          </Row>

        </Col>
        </Row>
      </Container>
      
    </div>
  );
};

export default Room;