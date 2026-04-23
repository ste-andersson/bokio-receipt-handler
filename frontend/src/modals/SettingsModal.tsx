function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <h2>Inställningar</h2>
      <button onClick={onClose}>Stäng</button>
    </div>
  );
}

export default SettingsModal;
