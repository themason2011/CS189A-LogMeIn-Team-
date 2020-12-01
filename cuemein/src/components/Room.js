import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import User from './User';
import DominantUser from './DominantUser';
import {Container, Row, Col, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const Room = ({ meetingname, token,emotion,logout, test}) => {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState([]);
  const [dominant, setDominant] = useState(null)

  useEffect(() => {
    const participantConnected = user => {
      setUser(prevusers => [...prevusers, user]);
    };

    const participantDisconnected = user => {
      setUser(prevusers =>
        prevusers.filter(p => p !== user)
      );
    };

    const participantDominantSpeaker = user => {
      setDominant(user);
      console.log("new dominant speaker")
    }

    Video.connect(token, {
      name: meetingname,
      dominantSpeaker:true
    }).then(room => {
      setRoom(room);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.on('dominantSpeakerChanged', participantDominantSpeaker);
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

  const remoteParticipants = user.map(user => (
    <Col className="remote-participants-camera">
      <User key={user.sid} user={user} />
    </Col>
  ));




  return (
    <div className="room">
      <Container className="cameras" fluid="true">
        <Row className="participants">
          <Col xs="auto" className="local-participant">
            {room ? (
              <div className="local-participant-camera">
                <User
                  key={room.localParticipant.sid}
                  user={room.localParticipant}
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
      <Container fluid>
        <Row className="dominant">
        <Col ></Col>
        {dominant ? (
            <DominantUser
                  key={dominant.sid}
                  user={dominant}
                />

        ): (
          <Col fluid className="dominant-default">

          </Col>
        )}
        <Col></Col>
        </Row>
      </Container>
      <Container fluid className="menu">
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
      
      </Container>
    
      
      
    </div>
  );
};

export default Room;