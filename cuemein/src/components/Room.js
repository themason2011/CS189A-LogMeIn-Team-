import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import User from './User';
import {Container, Row, Col} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const Room = ({ meetingname, token, logout }) => {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState([]);

  useEffect(() => {
    const participantConnected = user => {
      setUser(prevusers => [...prevusers, user]);
    };

    const participantDisconnected = user => {
      setUser(prevusers =>
        prevusers.filter(p => p !== user)
      );
    };

    Video.connect(token, {
      name: meetingname
    }).then(room => {
      setRoom(room);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
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
    <User key={user.sid} participant={user} />
  ));

  return (
    <div className="room">
      <h2>Room: {meetingname}</h2>
      <button onClick={logout}>Log out</button>
      <div className="local-participant">
        {room ? (
          <User
            key={room.localParticipant.sid}
            user={room.localParticipant}
          />
        ) : (
          ''
        )}
      </div>
      <h3>Remote Participants</h3>
      <div className="remote-participants">{remoteParticipants}</div>
    </div>
  );
};

export default Room;