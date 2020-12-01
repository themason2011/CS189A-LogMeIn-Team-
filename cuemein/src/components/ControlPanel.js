import React from 'react';
import {Container, Row, Form, Button} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const ControlPanel = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  handleSubmit
}) => {
  return (
    <Container className="controlpanel" fluid> 
      <Row className="control">
      <form onSubmit={handleSubmit}>
          <Form>
            <Form.Label className="meeting">Enter a Meeting</Form.Label>

            <Form.Group>
            <Form.Label className="name">Name:</Form.Label>
            <Form.Control className="inputname" size="lg" type="name" value={username}  onChange={handleUsernameChange} placeholder="Enter Name" />
            </Form.Group>

            <Form.Group>
            <Form.Label className="meetingname">Meeting name:</Form.Label>
            <Form.Control className="inputmeetingname" size="lg" type="meetingname"  value={roomName}  onChange={handleRoomNameChange} placeholder="Enter Meeting Name" />
            </Form.Group>

            <Button variant="primary" type="submit">Submit</Button>
          </Form>
      </form>
        {/* <form onSubmit={handleSubmit}>
          <h1>Enter a Meeting</h1>
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
            <label htmlFor="room">Meeting name:</label>
            <input
              type="text"
              id="room"
              value={roomName}
              onChange={handleRoomNameChange}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form> */}
      </Row>
    </Container>
  );
};

export default ControlPanel;