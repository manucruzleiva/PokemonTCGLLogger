import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "./MobileNavigation";
import DesktopNavigation from "./DesktopNavigation";
import AssistanceModal from "./AssistanceModal";
import HelpModal from "./HelpModal";
import DonationModal from "./DonationModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [showAssistanceModal, setShowAssistanceModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const handleAssistanceClick = () => {
    setShowAssistanceModal(true);
  };

  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  const handleDonationClick = () => {
    setShowDonationModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && (
        <>
          <DesktopNavigation 
            onAssistanceClick={handleAssistanceClick} 
            onHelpClick={handleHelpClick}
          />
          <MobileNavigation 
            onAssistanceClick={handleAssistanceClick}
            onHelpClick={handleHelpClick}
            onDonationClick={handleDonationClick}
          />
        </>
      )}
      
      <main className={isAuthenticated ? "pt-16" : ""}>
        {children}
      </main>

      {/* Global Modals */}
      <AssistanceModal
        isOpen={showAssistanceModal}
        onClose={() => setShowAssistanceModal(false)}
      />
      
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />
    </div>
  );
}