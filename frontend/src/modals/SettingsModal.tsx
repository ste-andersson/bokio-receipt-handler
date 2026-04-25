import { useEffect, useState } from "react";
import "./SettingsModal.css";
import { API_BASE_URL } from "../config/api";

function SettingsModal({
  onClose,
  clerkUserId,
}: {
  onClose: () => void;
  clerkUserId: string;
}) {
  const [companyId, setCompanyId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [token, setToken] = useState(localStorage.getItem("bokioToken") ?? "");
  const [aiProvider, setAiProvider] = useState("OPENAI");

  useEffect(() => {
    console.log("clerkUserId:", clerkUserId);
    fetch(`${API_BASE_URL}/api/users/settings`, {
      headers: { "X-Clerk-User-Id": clerkUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompanyId(data.companyId ?? "");
        setCustomPrompt(data.customPrompt ?? "");
        setAiProvider(data.aiProvider ?? "OPENAI");
        console.log("Fetched settings:", data);
      });
  }, [clerkUserId]);

  const handleSave = async () => {
    localStorage.setItem("bokioToken", token);

    await fetch(`${API_BASE_URL}/api/users/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": clerkUserId,
      },
      body: JSON.stringify({ companyId, customPrompt, aiProvider }),
    });

    onClose();
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-content">
        <h2 className="settings-modal-title">Inställningar</h2>
        <p className="settings-modal-subtitle">
          Hantera integrationer och hur AI-assistenten arbetar.
        </p>

        <div className="settings-form-grid">
          <label className="settings-field">
            <span className="settings-label">Company ID</span>
            <input
              className="settings-input"
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
          </label>

          <label className="settings-field">
            <span className="settings-label">Bokio Token</span>
            <input
              className="settings-input"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>

          <label className="settings-field">
            <span className="settings-label">AI-analys</span>
            <select
              className="settings-input settings-select"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
            >
              <option value="OPENAI">OpenAI</option>
              <option value="GROQ">Groq</option>
              <option value="GROK">Grok</option>
              <option value="OFF">Av</option>
            </select>
          </label>

          <label className="settings-field settings-field-full">
            <span className="settings-label">Egna instruktioner till AI</span>
            <textarea
              className="settings-input settings-textarea"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </label>
        </div>

        <div className="settings-actions">
          <button
            className="settings-button settings-button-secondary"
            onClick={onClose}
          >
            Stäng
          </button>
          <button
            className="settings-button settings-button-primary"
            onClick={handleSave}
          >
            Spara
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
