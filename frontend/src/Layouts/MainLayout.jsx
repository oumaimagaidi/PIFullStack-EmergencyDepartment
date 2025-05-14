// src/Layouts/MainLayout.jsx
import Header from "../components/header";
import Footer from "../components/footer";
import { useAccessibility } from '../context/AccessibilityContext'; // Hook pour TTS
import { Button } from "@/components/ui/button"; // Bouton UI
import { Volume2, VolumeX } from 'lucide-react'; // Icônes

export default function MainLayout({ children }) {
  const { isTTSActive, setIsTTSActive } = useAccessibility(); // Hook context

  return (
   
   <>
      <Header />
      
      <main>{children}</main>
      
      <Footer />

      {/* Bouton TTS flottant */}
      <Button
        className="fixed bottom-20 right-6 rounded-full w-12 h-12 shadow-lg z-50 flex items-center justify-center"
        onClick={() => setIsTTSActive(!isTTSActive)}
        title={isTTSActive ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
        style={{
          backgroundColor: isTTSActive ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
          color: isTTSActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--secondary-foreground))',
        }}
      >
        {isTTSActive ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
    </>
  );
}
