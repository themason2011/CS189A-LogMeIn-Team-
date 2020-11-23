import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import Room from './Room'
import Video, {LocalDataTrack} from 'twilio-video';
import { useState,useEffect,useCallback } from 'react';



const Camera = () => {
    const [track, setTrack] = useState(0)
    const [token, setToken] = useState(0)

    const handleUsernameChange = useCallback(event => {
        console.log("print fdafadfa")
        var AccessToken = require('twilio').jwt.AccessToken;
        var VideoGrant = AccessToken.VideoGrant;
        // Create an Access Token
        var accessToken = new AccessToken(
        'AC71013744d21d34272896475247890546',
        'SKc6dbd10e1b9ec0fd5c3606461c6ceff3',
        'Xvv9pop4eMToKUCFwBPYWYTtw7QWz3iR'
        );
  
        // Set the Identity of this token
        accessToken.identity = 'example-user';
  
        // Grant access to Video
        var grant = new VideoGrant();
        grant.room = 'cool room';
        accessToken.addGrant(grant);
  
        // Serialize the token as a JWT
        var jwt = accessToken.toJwt();

        setToken(accessToken)
        console.log(jwt)
      }, []);



        return(
            <Container fluid="true" className="camera">
                <Row >
                    <Col className="camera-personal">
                        <Room name={"hey"} token={token} />
                    </Col>
                    <Col xs={9} className="camera-participants">
                    Camera Participants
                    </Col>
                </Row>
            </Container>
        );

}

export default Camera;