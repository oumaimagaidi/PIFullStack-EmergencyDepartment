
import "./AnimatedBackground.css";


const AnimatedBackground = ({ children }) => {
  
  return (
    <div className="background-container">
      <div className="animated-half">
       
      </div>
      <div className="content-half">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
