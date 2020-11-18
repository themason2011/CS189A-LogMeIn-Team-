import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

class Camera extends React.Component{
    render(){
        return(
            <Container fluid="true" className="camera">
                <Row >
                    <Col className="camera-personal">
                    Camera Personal
                    </Col>
                    <Col xs={9} className="camera-participants">
                    Camera Participants
                    </Col>
                </Row>
            </Container>
        );
    }

}

export default Camera;