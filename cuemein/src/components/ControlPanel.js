import React from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const ControlPanel = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  handleSubmit
}) => {
  return (
    <Container fluid> 
      <Row className="control">
        <form onSubmit={handleSubmit}>
          <h1>Enter a room</h1>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="field"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>

          <div>
            <label htmlFor="room">Room name:</label>
            <input
              type="text"
              id="room"
              value={roomName}
              onChange={handleRoomNameChange}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </Row>
    </Container>
  );
};

export default ControlPanel;