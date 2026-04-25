import "./AccountingModal.css";
import accounts from "../data/accounts";
import { formatAmount, formatAmountOnBlur } from "../utils/formatAmount";
import { useAccountingModal } from "../hooks/useAccountingModal";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function AccountingModal({
  image,
  onClose,
  clerkUserId,
  uploadId,
}: {
  image: File;
  onClose: () => void;
  clerkUserId: string;
  uploadId?: string;
}) {
  const {
    title,
    setTitle,
    date,
    setDate,
    items,
    setItems,
    loading,
    totalDebit,
    totalCredit,
    isBalanced,
    activateRow,
    handleRowBlur,
    handleSubmit,
  } = useAccountingModal(image, clerkUserId, onClose, uploadId);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <h2 className="modal-title">Bokför kvitto</h2>

        <input
          className="title-input"
          type="text"
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="date-input"
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

        <div className="journal-grid">
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

        <div className="button-row">
          <button className="cancel-button" onClick={onClose}>
            Avbryt
          </button>
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!isBalanced || loading}
          >
            {loading ? "Bokför..." : "Bokför"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountingModal;
