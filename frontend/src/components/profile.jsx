import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Nav, Row, Col } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Cookies from 'js-cookie';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    personal: {},
    medical: {},
    professional: {}
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const token = Cookies.get("token");
    
    axios.get('http://localhost:8089/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      setProfileData(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setError('Error loading profile');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
        const token = Cookies.get("token");
      const response = await axios.put('http://localhost:8089/api/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const updatedData = response.data;
        setProfileData(updatedData);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving changes');
    }
  };

  const handleEdit = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Get available tabs based on user role
  const getTabs = () => {
    const tabs = ['personal'];
    if (profileData.personal?.role === 'Patient') {
      tabs.push('medical');
    } else if (['Doctor', 'Nurse', 'Administrator'].includes(profileData.personal?.role)) {
      tabs.push('professional');
    }
    return tabs;
  };

  // Render fields based on section and user role
  const renderFields = (section) => {
    const data = profileData[section] || {};
    
    // Skip certain fields that shouldn't be editable
    const skipFields = ['role'];
    
    return Object.entries(data).map(([field, value]) => {
      if (skipFields.includes(field)) return null;

      return (
        <Col md={6} key={field}>
          <div className="p-3 bg-light rounded">
            <Form.Group>
              <Form.Label className="text-muted text-capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </Form.Label>
              {isEditing ? (
                field === 'allergies' ? (
                  <Form.Control
                    as="textarea"
                    value={Array.isArray(value) ? value.join(', ') : value}
                    onChange={(e) => handleEdit(section, field, e.target.value.split(',').map(item => item.trim()))}
                  />
                ) : field === 'dateOfBirth' ? (
                  <Form.Control
                    type="date"
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleEdit(section, field, e.target.value)}
                  />
                ) : (
                  <Form.Control
                    value={value || ''}
                    onChange={(e) => handleEdit(section, field, e.target.value)}
                  />
                )
              ) : (
                <p className="mb-0" style={{ color: '#005477' }}>
                  {Array.isArray(value) ? value.join(', ') : value}
                </p>
              )}
            </Form.Group>
          </div>
        </Col>
      );
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header section */}
      <div 
        className="position-relative"
        style={{
          height: '250px',
          background: 'linear-gradient(to right, #005477, #6DDDCF)',
          overflow: 'hidden'
        }}
      >
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'linear-gradient(to right, #005477, #6DDDCF)',
            opacity: 0.2,
            animation: 'pulse 2s infinite'
          }}
        />
        
        <Container className="h-100 position-relative">
          <div className="d-flex align-items-center h-100" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="position-relative" style={{ 
              width: '128px',
              height: '128px',
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}>
              <img
                src="/images/Emergecy.png"
                alt="Profile"
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            <div className="text-white ms-4">
              <h1 className="display-6 fw-bold mb-0">
                {profileData.personal.username || 'User'}
              </h1>
              <p className="lead opacity-75">{profileData.personal.role}</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Main content */}
      <Container className="mt-n5">
        <Card className="shadow" style={{ animation: 'slideUp 0.5s ease-out' }}>
          <Card.Header className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <Nav variant="tabs">
                {getTabs().map((tab) => (
                  <Nav.Item key={tab}>
                    <Nav.Link
                      active={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        color: activeTab === tab ? '#005477' : '#6c757d',
                        borderBottom: activeTab === tab ? '2px solid #6DDDCF' : 'none'
                      }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                variant="outline-primary"
                style={{ backgroundColor: isEditing ? '#005477' : 'transparent', color: isEditing ? 'white' : '#005477' }}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </Card.Header>
          
          <Card.Body>
            <Row className="g-4">
              {renderFields(activeTab)}
            </Row>
          </Card.Body>
        </Card>
      </Container>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.2; }
            50% { opacity: 0.3; }
            100% { opacity: 0.2; }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;
