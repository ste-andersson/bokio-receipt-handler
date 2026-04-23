import { useRef } from "react";

function CameraButton({
  onImageCapture,
}: {
  onImageCapture: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageCapture(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleCapture}
      />
      <button onClick={() => inputRef.current?.click()}>
        Fotografera kvitto
      </button>
    </>
  );
}

export default CameraButton;
