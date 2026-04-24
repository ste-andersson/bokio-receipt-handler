import { useUser } from "@clerk/react";
import { useState } from "react";
import CameraButton from "./components/CameraButton";
import AccountingModal from "./modals/AccountingModal";
import SettingsModal from "./modals/SettingsModal";

function StartPage() {
  const { user } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clerkUserId = user?.id ?? "";

  return (
    <div>
      <h1>Receipt Handler</h1>
      <CameraButton onImageCapture={setImage} />
      <button onClick={() => setSettingsOpen(true)}>Inställningar</button>

      {image && (
        <AccountingModal
          image={image}
          clerkUserId={clerkUserId}
          onClose={() => setImage(null)}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          clerkUserId={clerkUserId}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default StartPage;
