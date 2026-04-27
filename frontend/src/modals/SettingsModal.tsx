import { useEffect, useState } from "react";
import "./Modal.css";
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
  const [companyAliases, setCompanyAliases] = useState<string[]>([]);
  const [newCompanyAlias, setNewCompanyAlias] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/settings`, {
      headers: { "X-Clerk-User-Id": clerkUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompanyId(data.companyId ?? "");
        setCustomPrompt(data.customPrompt ?? "");
        setAiProvider(data.aiProvider ?? "OPENAI");
      });

    fetch(`${API_BASE_URL}/api/companyalias`, {
      headers: { "X-Clerk-User-Id": clerkUserId },
    })
      .then((res) => res.json())
      .then((data) =>
        setCompanyAliases(
          data.map((a: { companyAlias: string }) => a.companyAlias),
        ),
      );
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

  const handleAddCompanyAlias = async () => {
    if (!newCompanyAlias.trim()) return;
    await fetch(`${API_BASE_URL}/api/companyalias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Clerk-User-Id": clerkUserId,
      },
      body: JSON.stringify({
        companyAlias: newCompanyAlias.trim().toLowerCase(),
      }),
    });
    setCompanyAliases([
      ...companyAliases,
      newCompanyAlias.trim().toLowerCase(),
    ]);
    setNewCompanyAlias("");
  };

  const handleDeleteCompanyAlias = async (companyAlias: string) => {
    await fetch(`${API_BASE_URL}/api/companyalias/${companyAlias}`, {
      method: "DELETE",
      headers: { "X-Clerk-User-Id": clerkUserId },
    });
    setCompanyAliases(companyAliases.filter((a) => a !== companyAlias));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Inställningar</h2>
        <p className="modal-subtitle">
          Hantera integrationer och hur AI-assistenten arbetar.
        </p>
        <div className="modal-form-grid">
          <label className="modal-field">
            <span className="modal-label">Company ID</span>
            <input
              className="modal-input"
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
          </label>
          <label className="modal-field">
            <span className="modal-label">Bokio Token</span>
            <input
              className="modal-input"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          <label className="modal-field">
            <span className="modal-label">AI-analys</span>
            <select
              className="modal-input modal-select"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
            >
              <option value="OPENAI">OpenAI</option>
              <option value="GROQ">Groq</option>
              <option value="GROK">Grok</option>
              <option value="OFF">Av</option>
            </select>
          </label>
          <label className="modal-field modal-field-full">
            <span className="modal-label">Egna instruktioner till AI</span>
            <textarea
              className="modal-input modal-textarea"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </label>
          <div className="modal-field modal-field-full">
            <span className="modal-label">Mailalias</span>
            <p className="settings-hint">
              Skicka kvitton till ditt-alias@kvitto.tekont.se
            </p>
            {companyAliases.length > 0 && (
              <ul className="settings-alias-list">
                {companyAliases.map((companyAlias) => (
                  <li key={companyAlias} className="settings-alias-item">
                    <span>{companyAlias}@kvitto.tekont.se</span>
                    <button
                      className="settings-alias-delete"
                      onClick={() => handleDeleteCompanyAlias(companyAlias)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="settings-alias-add">
              <input
                className="settings-input"
                type="text"
                placeholder="nytt-alias"
                value={newCompanyAlias}
                onChange={(e) => setNewCompanyAlias(e.target.value)}
              />
              <button
                className="modal-button modal-button-secondary"
                onClick={handleAddCompanyAlias}
              >
                Lägg till
              </button>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="modal-button modal-button-secondary"
            onClick={onClose}
          >
            Stäng
          </button>
          <button
            className="modal-button modal-button-primary"
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
