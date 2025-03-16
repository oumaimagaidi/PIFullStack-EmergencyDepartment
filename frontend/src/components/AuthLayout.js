import AnimatedBackground from "./AnimatedBackground";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Partie gauche avec l'animation */}
      <div className="w-1/2 h-full">
        <AnimatedBackground />
      </div>

      {/* Partie droite avec le formulaire */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
