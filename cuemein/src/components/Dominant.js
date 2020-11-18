import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

class Dominant extends React.Component{
    render(){
        return(
            <Container fluid="true" className="dominant">
                <Row className="dominant-camera">
                <Col>Dominant Speaker</Col>
                
                </Row>
            </Container>
        );



    }
}

export default Dominant;