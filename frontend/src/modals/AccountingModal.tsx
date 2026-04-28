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

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const el = dateRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  const formattedDate = date
    ? new Intl.DateTimeFormat("sv-SE", { dateStyle: "long" }).format(
        new Date(date + "T12:00:00"),
      )
    : "";
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

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [title]);

  return (
    <ModalShell onClose={animatedClose} contentRef={contentRef}>
      {suggesting && (
        <div className="suggesting-banner">
          <div className="suggesting-spinner" />
          <span>AI analyserar kvittot...</span>
        </div>
      )}

      <h2 className="modal-title">Bokför kvitto</h2>

      <textarea
        ref={titleRef}
        className={`title-input${suggesting ? " suggesting-blur" : ""}${titlePulse ? " title-input--pulse" : ""}`}
        placeholder="Inköp"
        value={title}
        rows={1}
        spellCheck={false}
        onChange={(e) => setTitle(e.target.value)}
        onAnimationEnd={() => setTitlePulse(false)}
      />

      <div
        className={`date-wrapper${suggesting ? " suggesting-blur" : ""}`}
        onClick={openDatePicker}
      >
        <span className="date-display">{formattedDate}</span>
        <span className="date-calendar-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="1.75" width="12.5" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.25"/>
            <line x1="0.75" y1="5.25" x2="13.25" y2="5.25" stroke="currentColor" strokeWidth="1.25"/>
            <line x1="4" y1="0.75" x2="4" y2="3.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
            <line x1="10" y1="0.75" x2="10" y2="3.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          ref={dateRef}
          className="date-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

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
