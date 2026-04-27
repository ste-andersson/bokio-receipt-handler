import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import "./Modal.css";
import "./SettingsModal.css";
import { API_BASE_URL } from "../config/api";
import { useAuthFetch } from "../hooks/useAuthFetch";

type VerifyStatus = "idle" | "loading" | "success" | "error";

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const authFetch = useAuthFetch();
  const [companyId, setCompanyId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [token, setToken] = useState(localStorage.getItem("bokioToken") ?? "");
  const [editingToken, setEditingToken] = useState(
    !localStorage.getItem("bokioToken"),
  );
  const [aiProvider, setAiProvider] = useState("OPENAI");
  const [companyAliases, setCompanyAliases] = useState<string[]>([]);
  const [newCompanyAlias, setNewCompanyAlias] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [companyName, setCompanyName] = useState("");

  const verifyCompany = async (tkn: string, cid: string) => {
    if (!tkn || !cid) return;
    setVerifyStatus("loading");
    setCompanyName("");
    try {
      const res = await authFetch(`${API_BASE_URL}/api/bokio/company`, {
        headers: {
          "X-Bokio-Token": tkn,
          "X-Bokio-Company-Id": cid,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyName(data.name ?? "");
        setVerifyStatus("success");
      } else {
        setVerifyStatus("error");
      }
    } catch {
      setVerifyStatus("error");
    }
  };

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/users/settings`)
      .then((res) => res.json())
      .then((data) => {
        const cid = data.companyId ?? "";
        setCompanyId(cid);
        setCustomPrompt(data.customPrompt ?? "");
        setAiProvider(data.aiProvider ?? "OPENAI");
        const tkn = localStorage.getItem("bokioToken") ?? "";
        if (cid && tkn) verifyCompany(tkn, cid);
      });

    authFetch(`${API_BASE_URL}/api/companyalias`)
      .then((res) => res.json())
      .then((data) =>
        setCompanyAliases(
          data.map((a: { companyAlias: string }) => a.companyAlias),
        ),
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleTokenBlur = () => {
    const trimmed = token.trim();
    if (trimmed) {
      localStorage.setItem("bokioToken", trimmed);
      setToken(trimmed);
      setEditingToken(false);
      verifyCompany(trimmed, companyId);
    }
  };

  const handleSave = async () => {
    localStorage.setItem("bokioToken", token);
    await authFetch(`${API_BASE_URL}/api/users/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, customPrompt, aiProvider }),
    });
    onClose();
  };

  const handleAddCompanyAlias = async () => {
    if (!newCompanyAlias.trim()) return;
    await authFetch(`${API_BASE_URL}/api/companyalias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    await authFetch(`${API_BASE_URL}/api/companyalias/${companyAlias}`, {
      method: "DELETE",
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
              onBlur={(e) => verifyCompany(token, e.target.value)}
            />
            {verifyStatus === "loading" && (
              <span className="settings-verify settings-verify-loading">
                Verifierar...
              </span>
            )}
            {verifyStatus === "success" && (
              <span className="settings-verify settings-verify-success">
                ✓ {companyName}
              </span>
            )}
            {verifyStatus === "error" && (
              <span className="settings-verify settings-verify-error">
                Kunde inte verifiera company ID med token
              </span>
            )}
          </label>
          <div className="modal-field">
            <span className="modal-label">Bokio Token</span>
            {editingToken ? (
              <textarea
                className="modal-input settings-token-input"
                placeholder="Klistra in din Bokio-token här"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onBlur={handleTokenBlur}
                autoFocus
              />
            ) : (
              <div className="settings-token-set">
                <span>Token inlagd ✓</span>
                <button
                  type="button"
                  className="settings-token-replace"
                  onClick={() => {
                    setToken("");
                    setEditingToken(true);
                  }}
                >
                  Byt ut
                </button>
              </div>
            )}
          </div>
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
              Skicka kvitton till ***@kvitto.tekont.se
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
                className="modal-input"
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
            disabled={verifyStatus === "loading" || verifyStatus === "error"}
          >
            Spara
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
