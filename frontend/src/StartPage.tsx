import { useUser, useAuth, SignInButton, UserButton } from "@clerk/react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const AI_PROVIDER_LABEL: Record<string, string> = {
  OPENAI: "AI: OpenAI",
  GROQ: "AI: Groq",
  GROK: "AI: Grok",
  OFF: "AI: av",
};
import CameraButton from "./components/CameraButton";
import AccountingModal from "./modals/AccountingModal";
import SettingsModal from "./modals/SettingsModal";
import "./StartPage.css";
import { API_BASE_URL } from "./config/api";
import logo from "./assets/logo-tekont.png";
import BacklogModal from "./modals/BacklogModal";
import MailBacklogModal from "./modals/MailBacklogModal";
import { useAuthFetch } from "./hooks/useAuthFetch";

function StartPage() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const [image, setImage] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | undefined>(undefined);
  const [mailReceiptId, setMailReceiptId] = useState<number | undefined>(
    undefined,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [mailBacklogOpen, setMailBacklogOpen] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [showBokioBacklog, setShowBokioBacklog] = useState(true);
  const [showTekontoBacklog, setShowTekontoBacklog] = useState(true);
  const [bokioStatus, setBokioStatus] = useState<
    "loading" | "connected" | "missing"
  >("loading");
  const [topbarCompanyName, setTopbarCompanyName] = useState("");
  const [topbarAiProvider, setTopbarAiProvider] = useState("OPENAI");
  const [settingsCompanyId, setSettingsCompanyId] = useState("");
  const [settingsCustomPrompt, setSettingsCustomPrompt] = useState("");

  const token = localStorage.getItem("bokioToken") ?? "";

  const { data: bokioBacklogItems } = useQuery<unknown[]>({
    queryKey: ["backlog-items", settingsCompanyId],
    queryFn: () =>
      authFetch(`${API_BASE_URL}/api/backlog`, {
        headers: {
          "X-Bokio-Token": token,
          "X-Bokio-Company-Id": settingsCompanyId,
        },
      }).then((res) => res.json()),
    enabled: !!settingsCompanyId && showBokioBacklog,
    staleTime: 60 * 1000,
  });

  const { data: tekontBacklogItems } = useQuery<unknown[]>({
    queryKey: ["receipt-items", settingsCompanyId],
    queryFn: () =>
      authFetch(`${API_BASE_URL}/api/receipts`, {
        headers: { "X-Bokio-Company-Id": settingsCompanyId },
      }).then((res) => res.json()),
    enabled: !!settingsCompanyId && showTekontoBacklog,
    staleTime: 60 * 1000,
  });

  const loadFeatureSettings = () => {
    authFetch(`${API_BASE_URL}/api/users/settings`)
      .then((res) => res.json())
      .then((data) => {
        setShowCamera(data.showCamera ?? true);
        setShowBokioBacklog(data.showBokioBacklog ?? true);
        setShowTekontoBacklog(data.showTekontoBacklog ?? true);
        setTopbarAiProvider(data.aiProvider ?? "OPENAI");
        setSettingsCompanyId(data.companyId ?? "");
        setSettingsCustomPrompt(data.customPrompt ?? "");
        const cid = data.companyId ?? "";
        const tkn = localStorage.getItem("bokioToken") ?? "";
        if (cid && tkn) {
          authFetch(`${API_BASE_URL}/api/bokio/company`, {
            headers: { "X-Bokio-Token": tkn, "X-Bokio-Company-Id": cid },
          })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((d) => {
              setTopbarCompanyName(d.name ?? "");
              setBokioStatus("connected");
            })
            .catch(() => setBokioStatus("missing"));
        } else {
          setBokioStatus("missing");
        }
      });
  };

  const toggleAi = () => {
    const newProvider = topbarAiProvider !== "OFF" ? "OFF" : "OPENAI";
    setTopbarAiProvider(newProvider);
    authFetch(`${API_BASE_URL}/api/users/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: settingsCompanyId,
        customPrompt: settingsCustomPrompt,
        aiProvider: newProvider,
        showCamera,
        showBokioBacklog,
        showTekontoBacklog,
      }),
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
        {user && (
          <div className="topbar-group">
            {bokioStatus !== "loading" && (
              <>
                <div
                  className={`topbar-chip ${bokioStatus === "connected" ? "topbar-chip-ok" : "topbar-chip-missing"}`}
                >
                  <span
                    className={`topbar-dot ${bokioStatus === "connected" ? "topbar-dot-green" : "topbar-dot-orange"}`}
                  />
                  <span className="topbar-chip-text">
                    {bokioStatus === "connected"
                      ? topbarCompanyName || "Bokio"
                      : "Bokio saknas"}
                  </span>
                </div>
                <div
                  className={`topbar-chip topbar-chip-interactive ${topbarAiProvider !== "OFF" ? "topbar-chip-ok" : "topbar-chip-off"}`}
                  onClick={toggleAi}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && toggleAi()}
                >
                  <span
                    className={`topbar-dot ${topbarAiProvider !== "OFF" ? "topbar-dot-green" : "topbar-dot-grey"}`}
                  />
                  <span className="topbar-chip-text">
                    {AI_PROVIDER_LABEL[topbarAiProvider] ?? topbarAiProvider}
                  </span>
                </div>
              </>
            )}
            <UserButton />
          </div>
        )}
      </header>
      <main className="main-content">
        {!user ? (
          <div className="signin-container">
            <img src={logo} alt="Tekont" className="hero-logo" />
            <p className="signin-subtitle">
              Ditt kvitto. Bokfört. På sekunder.
            </p>
            <div className="signin-steps">
              <span className="signin-step">Fotografera</span>
              <span className="signin-step-arrow">→</span>
              <span className="signin-step">Kontera</span>
              <span className="signin-step-arrow">→</span>
              <span className="signin-step">Klart</span>
            </div>
            <div className="signin-features">
              <span>Integration med Bokio</span>
              <span className="signin-features-dot">·</span>
              <span>AI-assisterad kontering</span>
              <span className="signin-features-dot">·</span>
              <span>Kvitton via mail</span>
            </div>
            <div className="signin-cta">
              <SignInButton>
                <button className="btn-primary">Logga in</button>
              </SignInButton>
              <p className="signin-login-hint">
                Logga in med ditt Google-, Apple- eller LinkedIn-konto, eller
                registrera dig med din e-postadress.
              </p>
            </div>
          </div>
        ) : (
          <div className="logged-in-content">
            <img src={logo} alt="Tekont" className="hero-logo" />
            <div className="action-buttons">
              {bokioStatus === "connected" && (
                <>
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
                      {bokioBacklogItems != null
                        ? ` (${bokioBacklogItems.length})`
                        : ""}
                    </button>
                  )}
                  {showTekontoBacklog && (
                    <button
                      className="btn-secondary action-btn"
                      onClick={() => setMailBacklogOpen(true)}
                    >
                      Tekont-backlog
                      {tekontBacklogItems != null
                        ? ` (${tekontBacklogItems.length})`
                        : ""}
                    </button>
                  )}
                </>
              )}
              {bokioStatus === "missing" && (
                <p className="setup-hint">
                  Gå in i Inställningar nedan och fyll i ditt Bokio-ID och din
                  Bokio-token för att använda appen.
                </p>
              )}
              <button
                className={`action-btn ${bokioStatus === "missing" ? "btn-primary" : "btn-ghost"}`}
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
        <SettingsModal
          onClose={() => {
            setSettingsOpen(false);
            loadFeatureSettings();
          }}
        />
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
