import "./AccountingModal.css";
import ModalShell from "./ModalShell";
import { AccountCombobox } from "./AccountCombobox";
import { formatAmount, formatAmountOnBlur } from "../utils/formatAmount";
import { useAccountingModal } from "../hooks/useAccountingModal";
import { useEffect, useRef, useState } from "react";
import { useAnimatedClose } from "../hooks/useAnimatedClose";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function AccountingModal({
  image,
  onClose,
  uploadId,
  mailReceiptId,
}: {
  image: File;
  onClose: () => void;
  uploadId?: string;
  mailReceiptId?: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const animatedClose = useAnimatedClose(contentRef, onClose);

  const {
    title,
    setTitle,
    date,
    setDate,
    items,
    setItems,
    loading,
    suggesting,
    totalDebit,
    totalCredit,
    isBalanced,
    addRow,
    handleRowBlur,
    handleSubmit,
  } = useAccountingModal(image, animatedClose, uploadId, mailReceiptId);

  const titleRef = useRef<HTMLInputElement>(null);
  const wasSuggesting = useRef(false);
  const [titlePulse, setTitlePulse] = useState(false);
  const [photoExpanded, setPhotoExpanded] = useState(false);

  useEffect(() => {
    if (suggesting) {
      wasSuggesting.current = true;
    } else if (wasSuggesting.current) {
      wasSuggesting.current = false;
      titleRef.current?.focus();
      titleRef.current?.select();
      setTitlePulse(true);
    }
  }, [suggesting]);

  return (
    <ModalShell onClose={animatedClose} contentRef={contentRef}>
      {suggesting && (
        <div className="suggesting-banner">
          <div className="suggesting-spinner" />
          <span>AI analyserar kvittot...</span>
        </div>
      )}

      <h2 className="modal-title">Bokför kvitto</h2>

      <input
        ref={titleRef}
        className={`title-input${suggesting ? " suggesting-blur" : ""}${titlePulse ? " title-input--pulse" : ""}`}
        type="text"
        placeholder="Inköp"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onAnimationEnd={() => setTitlePulse(false)}
      />

      <input
        className={`date-input${suggesting ? " suggesting-blur" : ""}`}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div
        className={`receipt-photo-wrapper${photoExpanded ? " receipt-photo-wrapper--expanded" : ""}`}
        onClick={() => { if (!photoExpanded) setPhotoExpanded(true); }}
      >
        {image.type === "application/pdf" ? (
          <Document file={image}>
            <Page
              pageNumber={1}
              width={window.innerWidth > 600 ? 560 : window.innerWidth - 32}
            />
          </Document>
        ) : (
          <img
            className="receipt-photo"
            src={URL.createObjectURL(image)}
            alt="Kvitto"
          />
        )}
        {!photoExpanded && (
          <div className="receipt-photo-expand-overlay">
            <span className="receipt-photo-expand-label">Visa hela kvittot</span>
          </div>
        )}
      </div>
      {photoExpanded && (
        <button
          className="receipt-photo-collapse"
          onClick={() => setPhotoExpanded(false)}
        >
          Dölj kvittot
        </button>
      )}

      <div className={`journal-grid${suggesting ? " suggesting-blur" : ""}`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="journal-row"
            onBlur={() => handleRowBlur(index)}
          >
            <div className="account-label">
              <AccountCombobox
                value={item.account}
                autoFocus={item.autoFocus}
                onChange={(acc) => {
                  const updated = [...items];
                  updated[index].account = acc;
                  setItems(updated);
                }}
              />
            </div>
            <input
              className="debit-input"
              type="text"
              inputMode="decimal"
              value={item.debit}
              onChange={(e) => {
                const updated = [...items];
                updated[index].debit = formatAmount(e.target.value);
                setItems(updated);
              }}
              onBlur={(e) => {
                const updated = [...items];
                updated[index].debit = formatAmountOnBlur(e.target.value);
                setItems(updated);
              }}
            />
            <div className="t-separator" />
            <input
              className="credit-input"
              type="text"
              inputMode="decimal"
              value={item.credit}
              onChange={(e) => {
                const updated = [...items];
                updated[index].credit = formatAmount(e.target.value);
                setItems(updated);
              }}
              onBlur={(e) => {
                const updated = [...items];
                updated[index].credit = formatAmountOnBlur(e.target.value);
                setItems(updated);
              }}
            />
          </div>
        ))}

        <button type="button" className="add-account-button" onClick={addRow}>
          + Lägg till T-konto
        </button>

        <div className="journal-summary">
          <span className="summary-label-debit">Debet</span>
          <span className="summary-label-credit">Kredit</span>
          <strong className="summary-total-debit">{totalDebit}</strong>
          <strong className="summary-total-credit">{totalCredit}</strong>
        </div>
      </div>

      <div className={`modal-actions${suggesting ? " suggesting-blur" : ""}`}>
        <button
          className="modal-button modal-button-secondary"
          onClick={animatedClose}
        >
          Stäng
        </button>
        <button
          className="modal-button modal-button-primary"
          onClick={handleSubmit}
          disabled={!isBalanced || loading || suggesting}
        >
          {loading ? "Bokför..." : "Bokför"}
        </button>
      </div>
    </ModalShell>
  );
}

export default AccountingModal;
