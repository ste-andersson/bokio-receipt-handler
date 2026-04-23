import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [companyId, setCompanyId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [token, setToken] = useState(localStorage.getItem("bokioToken") ?? "");

  useEffect(() => {
    fetch(`${API_URL}/api/users/settings`)
      .then((res) => res.json())
      .then((data) => {
        setCompanyId(data.companyId ?? "");
        setCustomPrompt(data.customPrompt ?? "");
      });
  }, []);

  const handleSave = async () => {
    localStorage.setItem("bokioToken", token);

    await fetch(`${API_URL}/api/users/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, customPrompt }),
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Inställningar</h2>

        <label>Company ID</label>
        <input
          type="text"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        />

        <label>Bokio Token</label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <label>Egna instruktioner till AI</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={4}
        />

        <button onClick={handleSave}>Spara</button>
        <button onClick={onClose}>Stäng</button>
      </div>
    </div>
  );
}

export default SettingsModal;
