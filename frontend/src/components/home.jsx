import React from "react";
import {  Button, Carousel, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  return (
    <div>
   {/* Main Carousel */}
<main role="main" style={{ paddingTop: "0.9rem", width: "100%" }}>
  <Carousel fade className="w-100">
    <Carousel.Item>
      <img 
        className="d-block w-100" 
        src="/images/cover.jpg" 
        alt="Team member 1" 
        style={{ maxHeight: "600px", objectFit: "cover" }}
      />
    </Carousel.Item>

    <Carousel.Item>
      <img 
        className="d-block w-100" 
        src="/images/cover2.jpg" 
        alt="Team member 2" 
        style={{ maxHeight: "600px", objectFit: "cover" }}
      />
    </Carousel.Item>

    <Carousel.Item>
      <img 
        className="d-block w-100" 
        src="/images/patients_emergency_flow.jpg" 
        alt="Team members in emergency department" 
        style={{ maxHeight: "600px", objectFit: "cover" }}
      />
    </Carousel.Item>
  </Carousel>



        {/* Marketing Section */}
        <Container className="marketing">
          <Row>
            <Col lg={4} className="text-center mb-3">
              <img 
                className="rounded-circle" 
                src="/images/Emergecy.png" 
                alt="Team member 1" 
                width="140" 
                height="140" 
                
                style={{ objectFit: "cover",backgroundColor: "#005477" }}
              />
              <h2>Heading</h2>
              <p>Donec sed odio dui. Etiam porta sem malesuada magna mollis euismod.</p>
              <Button style={{ backgroundColor: "#005477", borderColor: "#005477", color: "white" }}>View details &raquo;</Button>
            </Col>
            <Col lg={4} className="text-center mb-3">
              <img 
                className="rounded-circle" 
                src="/images/equipe2-removebg-preview.png" 
                alt="Team member 2" 
                width="140" 
                height="140" 
                style={{ objectFit: "cover" ,backgroundColor: "#005477"}}
              />
              <h2>Heading</h2>
              <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
              <Button  style={{ backgroundColor: "#005477", borderColor: "#005477", color: "white" }}>View details &raquo;</Button>
            </Col>
            <Col lg={4} className="text-center mb-3">
              <img 
                className="rounded-circle" 
                src="/images/electronic_medical_records-removebg-preview.png" 
                alt="Team members in emergency department" 
                width="140" 
                height="140" 
                style={{ objectFit: "cover" ,backgroundColor: "#005477"}}
              />
              <h2>Heading</h2>
              <p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam.</p>
              <Button style={{ backgroundColor: "#005477", borderColor: "#005477", color: "white" }}>View details &raquo;</Button>
            </Col>
          </Row>

          {/* Featurettes */}
          <hr className="featurette-divider" />
          <Row className="featurette">
            <Col md={7}>
              <h2 className="featurette-heading" style={{ color: "#6DDDCF" }}>First featurette heading. <span className="text-muted">It'll blow your mind.</span></h2>
              <p className="lead" style={{ color: "#5a5a5a" }}>Donec ullamcorper nulla non metus auctor fringilla. Fusce dapibus, tellus ac cursus commodo.</p>
            </Col>
            <Col md={5}>
              <img 
                className="featurette-image img-fluid mx-auto" 
                src="/images/Emergecy.png" 
                alt="Emergency department overview" 
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </Col>
          </Row>
          <hr className="featurette-divider" />
        </Container>
      </main>
    </div>
  );
}

export default Home;
