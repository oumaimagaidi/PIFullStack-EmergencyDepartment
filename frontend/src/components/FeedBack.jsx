import React, { useState, useEffect } from "react";
import { MdFeedback, MdPerson } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { io } from "socket.io-client";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({ feedback: "", rating: 0 });
  const [hoverRating, setHoverRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Fetch feedbacks and user's feedback
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all feedbacks
        const feedbacksResponse = await fetch("http://localhost:8089/api/feedback", {
          credentials: 'include'
        });
        
        if (!feedbacksResponse.ok) throw new Error('Failed to fetch feedbacks');
        const feedbacksData = await feedbacksResponse.json();
        setFeedbacks(feedbacksData);

        // Fetch user's feedback
        const userFeedbackResponse = await fetch("http://localhost:8089/api/feedback/my-feedback", {
          credentials: 'include'
        });
        
        if (userFeedbackResponse.ok) {
          const userFeedbackData = await userFeedbackResponse.json();
          setUserFeedback(userFeedbackData);
        }
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Initialize Socket.IO connection with credentials
    const newSocket = io("http://localhost:8089", {
      withCredentials: true,
      transports: ['websocket']
    });
    
    setSocket(newSocket);

    // Socket.IO event listeners
    newSocket.on("newFeedback", (newFeedback) => {
      setFeedbacks(prev => [newFeedback, ...prev]);
    });

    newSocket.on("feedbackDeleted", (data) => {
      setFeedbacks(prev => prev.filter(fb => fb._id !== data.id));
    });

    return () => newSocket.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingClick = (ratingValue) => {
    setFormData({ ...formData, rating: ratingValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:8089/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      setUserFeedback(data);
      setFormData({ feedback: "", rating: 0 });
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(error.message);
    }
  };

  // Animation des particules
  useEffect(() => {
    const canvas = document.querySelector(".particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = "rgba(66, 165, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="feedback-container">
      <style>
        {`
          .feedback-container {
            padding: 80px 20px;
            background: linear-gradient(135deg, #f8fbff 0%, #e6f0fa 100%);
            min-height: 100vh;
            color: #333;
            position: relative;
            overflow: hidden;
          }

          .particles-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }

          .feedback-section {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
            position: relative;
            z-index: 1;
          }

          .section-header {
            margin-bottom: 50px;
          }

          .section-header h2 {
            font-size: 3rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            background: linear-gradient(90deg, #0056b3, #42a5ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          }

          .section-header p {
            font-size: 1.2rem;
            font-family: 'Roboto', sans-serif;
            color: rgba(92, 173, 179, 0.79);
            max-width: 700px;
            margin: 0 auto;
            font-weight: 300;
          }

          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
          }

          .testimonial-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
            animation: fadeInUp 0.6s ease forwards;
            animation-delay: calc(var(--card-index) * 0.1s);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .testimonial-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(66, 165, 255, 0.5);
          }

          .testimonial-icon {
            font-size: 2.5rem;
            color: #42a5ff;
            margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            padding: 10px;
          }

          .testimonial-card h4 {
            font-size: 1.5rem;
            font-family: 'Poppins', sans-serif;
            color: #0056b3;
            margin-bottom: 10px;
          }

          .testimonial-card p {
            font-size: 1rem;
            font-family: 'Roboto', sans-serif;
            color: #555;
            margin-bottom: 15px;
            line-height: 1.5;
          }

          .testimonial-rating {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
          }

          .testimonial-star {
            font-size: 1.2rem;
            color: #ddd;
          }

          .testimonial-star.filled {
            color: rgb(241, 233, 77);
          }

          .testimonial-date {
            font-size: 0.9rem;
            font-family: 'Roboto', sans-serif;
            font-style: italic;
            color: rgb(142, 185, 193);
          }

          .feedback-form {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            animation: fadeInUp 0.6s ease forwards;
          }

          .feedback-form h3 {
            font-size: 2rem;
            font-family: 'Poppins', sans-serif;
            color: #0056b3;
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 25px;
            text-align: left;
          }

          .form-group label {
            display: block;
            font-size: 1.1rem;
            font-family: 'Roboto', sans-serif;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid rgba(66, 165, 255, 0.3);
            background: rgba(255, 255, 255, 0.6);
            font-family: 'Roboto', sans-serif;
            font-size: 1rem;
            color: #333;
            transition: all 0.3s ease;
            resize: vertical;
            min-height: 120px;
          }

          .form-group textarea:focus {
            outline: none;
            border-color: #42a5ff;
            box-shadow: 0 0 10px rgba(66, 165, 255, 0.3);
          }

          .rating-group {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 20px;
          }

          .rating-star {
            font-size: 1.5rem;
            cursor: pointer;
            color: #ddd;
            transition: color 0.2s ease;
          }

          .rating-star.filled,
          .rating-star:hover,
          .rating-star:hover ~ .rating-star {
            color: rgb(247, 234, 134);
          }

          .submit-btn {
            display: inline-flex;
            align-items: center;
            background-color: #42a5ff;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(66, 165, 255, 0.3);
            border: none;
            cursor: pointer;
          }

          .submit-btn:hover {
            background-color: #0056b3;
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(66, 165, 255, 0.4);
          }

          .btn-icon {
            margin-right: 8px;
            font-size: 1.2rem;
          }

          .user-feedback-message {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: center;
          }
          
          .user-feedback-message p {
            margin-bottom: 10px;
          }
          
          .user-rating {
            display: flex;
            justify-content: center;
            gap: 5px;
            margin: 10px 0;
          }

          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 1.5rem;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            .section-header h2 {
              font-size: 2rem;
            }

            .feedback-form {
              padding: 25px;
            }

            .feedback-form h3 {
              font-size: 1.8rem;
            }

            .testimonials-grid {
              grid-template-columns: 1fr;
            }

            .rating-star {
              font-size: 1.3rem;
            }
          }

          @media (max-width: 480px) {
            .section-header h2 {
              font-size: 1.8rem;
            }

            .section-header p {
              font-size: 1rem;
            }

            .testimonial-card h4 {
              font-size: 1.3rem;
            }

            .feedback-form h3 {
              font-size: 1.5rem;
            }

            .submit-btn {
              padding: 10px 20px;
              font-size: 0.9rem;
            }
          }
        `}
      </style>

      <section className="feedback-section">
        <div className="section-header">
          <h2>Patient Feedback</h2>
          <p>Continuous improvement through patient insights</p>
        </div>

        <div className="testimonials-grid">
          {feedbacks.map((feedback, index) => (
            <div key={feedback._id} className="testimonial-card" style={{ '--card-index': index }}>
              {feedback.user?.profileImage ? (
                <img 
                  src={feedback.user.profileImage} 
                  alt={feedback.user.username} 
                  className="testimonial-icon"
                  style={{ borderRadius: '50%', width: '60px', height: '60px', objectFit: 'cover' }}
                />
              ) : (
                <MdPerson className="testimonial-icon" />
              )}
              <h4>{feedback.user?.username || 'Anonymous'}</h4>
              {feedback.user?.role && (
                <small style={{ color: '#666', marginBottom: '5px' }}>
                  {feedback.user.role}
                </small>
              )}
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`testimonial-star ${i < feedback.rating ? "filled" : ""}`}
                  />
                ))}
              </div>
              <p>{feedback.feedback}</p>
              <div className="testimonial-date">
                {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="feedback-form">
          <h3>Share Your Feedback</h3>
          { (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="feedback">Your Feedback</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Tell us about your experience..."
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Rate Your Experience</label>
                <div className="rating-group">
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = i + 1;
                    return (
                      <FaStar
                        key={i}
                        className={`rating-star ${ratingValue <= (hoverRating || formData.rating) ? "filled" : ""}`}
                        onClick={() => handleRatingClick(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    );
                  })}
                </div>
              </div>
              <button type="submit" className="submit-btn">
                <MdFeedback className="btn-icon" /> Submit Feedback
              </button>
            </form>
          )}
        </div>
      </section>
      <canvas className="particles-canvas"></canvas>
    </div>
 
  );
};

export default Feedback;