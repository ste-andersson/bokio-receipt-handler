import { useRef } from "react";
import { useSwipeToClose } from "../hooks/useSwipeToClose";
import "./Modal.css";

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useSwipeToClose(contentRef, onClose);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div ref={contentRef} className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;
