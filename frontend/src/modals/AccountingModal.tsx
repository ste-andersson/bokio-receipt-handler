import "./Modal.css";
import "./AccountingModal.css";
import accounts from "../data/accounts";
import { formatAmount, formatAmountOnBlur } from "../utils/formatAmount";
import { useAccountingModal } from "../hooks/useAccountingModal";
import { useEffect, useRef, useState } from "react";
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
    activateRow,
    handleRowBlur,
    handleSubmit,
  } = useAccountingModal(image, onClose, uploadId, mailReceiptId);

  const titleRef = useRef<HTMLInputElement>(null);
  const wasSuggesting = useRef(false);
  const [titlePulse, setTitlePulse] = useState(false);

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
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

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

        <div className={`journal-grid${suggesting ? " suggesting-blur" : ""}`}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`journal-row ${item.placeholder ? "placeholder-row" : ""}`}
              onClick={() => item.placeholder && activateRow(index)}
              onBlur={() => handleRowBlur(index)}
            >
              <div className="account-label">
                {item.placeholder ? (
                  <span className="placeholder-text">
                    Lägg till konto eller skriv nummer
                  </span>
                ) : (
                  <>
                    <input
                      className="account-number"
                      type="text"
                      maxLength={4}
                      value={item.account}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[index].account = e.target.value;
                        setItems(updated);
                      }}
                    />
                    <span className="account-name">
                      {accounts[item.account] ?? "—"}
                    </span>
                  </>
                )}
              </div>
              <input
                className="debit-input"
                type="text"
                inputMode="decimal"
                value={item.debit}
                onFocus={() => item.placeholder && activateRow(index)}
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
                onFocus={() => item.placeholder && activateRow(index)}
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
            onClick={onClose}
          >
            Avbryt
          </button>
          <button
            className="modal-button modal-button-primary"
            onClick={handleSubmit}
            disabled={!isBalanced || loading || suggesting}
          >
            {loading ? "Bokför..." : "Bokför"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountingModal;
