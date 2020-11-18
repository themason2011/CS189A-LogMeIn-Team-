import React, {Component} from "react"
import {Container, Row, Col} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';


class Tool extends React.Component{
     
    
    render(){
        return(
            <Container fluid = "true" className="tool">
                <Row className="tools">
                    <Col>Tool</Col>
                </Row>
            </Container>
       
        

        );
    }
}




export default Tool


