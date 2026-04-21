import React from 'react';
import { Container } from 'react-bootstrap';

const StudentDashboard = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div style={{ backgroundColor: '#ffcccc', border: '2px solid red', padding: '2rem', borderRadius: '10px', textAlign: 'center' }}>
        <h1 style={{ color: 'red', margin: 0 }}>Student Dashboard</h1>
      </div>
    </Container>
  );
};

export default StudentDashboard;
