import React, { useState, useEffect, useCallback } from 'react';
import Video from 'twilio-video';
import User from './User';
import DominantUser from './DominantUser';
import {Container, Row, Col, Button, Navbar, Nav} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const helpers = require('./helpers');
const muteYourAudio = helpers.muteYourAudio;
const unmuteYourAudio = helpers.unmuteYourAudio;


const Room = ({ meetingname, token,emotion,logout, test}) => {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState([]);
  const [dominant, setDominant] = useState(null);
  const [newDomName, setNewDomName] = useState(null);
  const [mute, setMute] = useState(false);

  useEffect(() => {
    const participantConnected = user => {
      setUser(prevusers => [...prevusers, user]);
    };

    const participantDisconnected = user => {
      setUser(prevusers =>
        prevusers.filter(p => p !== user)
      );
    };

    const ParticipantDominantSpeaker = user => {
      setDominant(user);
      console.log("new dominant speaker")
    }

    const ParticipantNewDominantSpeaker = user => {
      setNewDomName(user.identity);
      console.log("new dominant speaker name")
    }

    Video.connect(token, {
      name: meetingname,
      dominantSpeaker:true
    }).then(room => {
      setRoom(room);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.on('dominantSpeakerChanged', ParticipantDominantSpeaker);
      room.on('dominantSpeakerChanged', ParticipantNewDominantSpeaker);
      room.participants.forEach(participantConnected);
      
    });

    return () => {
      setRoom(currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [meetingname, token]);

  const mutecallback = useCallback(event => {
    if(mute===false){
      setMute(true);
    }
    else if(mute===true){
      setMute(false);
    }
  },[mute]);

  const remoteParticipants = user.map((user,index) => (
    <Col key="remote-participants"className="remote-participants-camera">
      <User key={index} user={user} />
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
            <Button variant="danger" onClick={logout}>LOG OUT</Button>
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
                  mute={mute}
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
          {dominant ? (
              <DominantUser
                  key={dominant.sid}
                  user={dominant}
                />

        ): (
          <Col md={9} fluid = "true" className="dominant-default">

          </Col>

        )}
        <Col md={2} >
          <Button className="mutebtn" onClick={mutecallback}>Mute "work in progress"</Button>
          {mute.toString()}
        </Col>
        </Row>
      </Container>
      {/* <Container fluid className="menu"> 
        <Row>
          <h2>Meeting Name: {meetingname}</h2>
        </Row>
        <Row>
              <Col className="buttons"sm={2}>
              <Button variant="danger" onClick={logout}>LOG OUT</Button>
              </Col>
              <Col sm={10}>
              </Col>
        </Row>
      
        </Container> */}
    
      
      
    </div>
  );
};

export default Room;