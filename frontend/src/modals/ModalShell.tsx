import { useEffect, useRef } from "react";
import { useSwipeToClose } from "../hooks/useSwipeToClose";
import "./Modal.css";

function ModalShell({
  children,
  onClose,
  contentRef: externalRef,
}: {
  children: React.ReactNode;
  onClose: () => void;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const contentRef = externalRef ?? internalRef;
  useSwipeToClose(contentRef, onClose);

  useEffect(() => {
    const prev = document.documentElement.style.overscrollBehavior;
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.documentElement.style.overscrollBehavior = prev;
    };
  }, []);

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
