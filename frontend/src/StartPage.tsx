import { useUser, SignInButton, UserButton } from "@clerk/react";
import { useEffect, useState } from "react";
import CameraButton from "./components/CameraButton";
import AccountingModal from "./modals/AccountingModal";
import SettingsModal from "./modals/SettingsModal";
import "./StartPage.css";
import { API_BASE_URL } from "./config/api";
import logo from "./assets/logo-tekont.png";
import logomini from "./assets/logo-symbol.png";
import BacklogModal from "./modals/BacklogModal";
import MailBacklogModal from "./modals/MailBacklogModal";

function StartPage() {
  const { user, isLoaded } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const clerkUserId = user?.id ?? "";
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [mailBacklogOpen, setMailBacklogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE_URL}/api/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      }),
    });
  }, [user]);

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
              <CameraButton
                onImageCapture={(file) => {
                  setUploadId(undefined);
                  setImage(file);
                }}
              />
              <button
                className="btn-secondary action-btn"
                onClick={() => setBacklogOpen(true)}
              >
                Bokio-backlog
              </button>
              <button
                className="btn-secondary action-btn"
                onClick={() => setMailBacklogOpen(true)}
              >
                Tekont-backlog
              </button>
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
          clerkUserId={clerkUserId}
          uploadId={uploadId}
          onClose={() => {
            setImage(null);
            setUploadId(undefined);
          }}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          clerkUserId={clerkUserId}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {backlogOpen && (
        <BacklogModal
          clerkUserId={clerkUserId}
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
          clerkUserId={clerkUserId}
          onClose={() => setMailBacklogOpen(false)}
          onImageSelect={(file: File) => {
            setImage(file);
            setMailBacklogOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default StartPage;
