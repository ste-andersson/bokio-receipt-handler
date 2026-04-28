import { useUser, useAuth, SignInButton, UserButton } from "@clerk/react";
import { useState, useEffect } from "react";
import CameraButton from "./components/CameraButton";
import AccountingModal from "./modals/AccountingModal";
import SettingsModal from "./modals/SettingsModal";
import "./StartPage.css";
import { API_BASE_URL } from "./config/api";
import logo from "./assets/logo-tekont.png";
import logomini from "./assets/logo-symbol.png";
import BacklogModal from "./modals/BacklogModal";
import MailBacklogModal from "./modals/MailBacklogModal";
import { useAuthFetch } from "./hooks/useAuthFetch";

function StartPage() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const [image, setImage] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | undefined>(undefined);
  const [mailReceiptId, setMailReceiptId] = useState<number | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [mailBacklogOpen, setMailBacklogOpen] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [showBokioBacklog, setShowBokioBacklog] = useState(true);
  const [showTekontoBacklog, setShowTekontoBacklog] = useState(true);

  const loadFeatureSettings = () => {
    authFetch(`${API_BASE_URL}/api/users/settings`)
      .then((res) => res.json())
      .then((data) => {
        setShowCamera(data.showCamera ?? true);
        setShowBokioBacklog(data.showBokioBacklog ?? true);
        setShowTekontoBacklog(data.showTekontoBacklog ?? true);
      });
  };

  useEffect(() => {
    if (user) loadFeatureSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (isLoaded && isSignedIn && user && !hasSynced) {
    setHasSynced(true);
    authFetch(`${API_BASE_URL}/api/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.primaryEmailAddress?.emailAddress }),
    });
  }

  if (!isLoaded) return null;

  return (
    <div className="app">
      <header className="topbar">
        <img src={logomini} alt="Tekont" className="topbar-logo" />
        {user && (
          <div className="topbar-user">
            <UserButton />
          </div>
        )}
      </header>
      <main className="main-content">
        {!user ? (
          <div className="signin-container">
            <img src={logo} alt="Tekont" className="hero-logo" />
            <p className="signin-subtitle">Bokför kvitton. Enkelt.</p>
            <SignInButton>
              <button className="btn-primary">Logga in</button>
            </SignInButton>
          </div>
        ) : (
          <div className="logged-in-content">
            <img src={logo} alt="Tekont" className="hero-logo" />
            <div className="action-buttons">
              {showCamera && (
                <CameraButton
                  onImageCapture={(file) => {
                    setUploadId(undefined);
                    setImage(file);
                  }}
                />
              )}
              {showBokioBacklog && (
                <button
                  className="btn-secondary action-btn"
                  onClick={() => setBacklogOpen(true)}
                >
                  Bokio-backlog
                </button>
              )}
              {showTekontoBacklog && (
                <button
                  className="btn-secondary action-btn"
                  onClick={() => setMailBacklogOpen(true)}
                >
                  Tekont-backlog
                </button>
              )}
              <button
                className="btn-ghost action-btn"
                onClick={() => setSettingsOpen(true)}
              >
                Inställningar
              </button>
            </div>
          </div>
        )}
      </main>
      {image && (
        <AccountingModal
          image={image}
          uploadId={uploadId}
          mailReceiptId={mailReceiptId}
          onClose={() => {
            setImage(null);
            setUploadId(undefined);
            setMailReceiptId(undefined);
          }}
        />
      )}
      {settingsOpen && (
        <SettingsModal onClose={() => { setSettingsOpen(false); loadFeatureSettings(); }} />
      )}
      {backlogOpen && (
        <BacklogModal
          onClose={() => setBacklogOpen(false)}
          onImageSelect={(file: File, id: string) => {
            setUploadId(id);
            setImage(file);
            setBacklogOpen(false);
          }}
        />
      )}
      {mailBacklogOpen && (
        <MailBacklogModal
          onClose={() => setMailBacklogOpen(false)}
          onImageSelect={(file: File, receiptId: number) => {
            setUploadId(undefined);
            setMailReceiptId(receiptId);
            setImage(file);
            setMailBacklogOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default StartPage;
