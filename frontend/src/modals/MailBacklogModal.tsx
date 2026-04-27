import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Modal.css";
import "./BacklogModal.css";
import { API_BASE_URL } from "../config/api";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReceiptItem {
  id: number;
  contentType: string;
  originalFilename: string;
  receivedAt: string;
}

function MailReceiptThumbnail({
  item,
  companyId,
  onClick,
  index,
}: {
  item: ReceiptItem;
  companyId: string;
  onClick: (file: File) => void;
  index: number;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/receipts/${item.id}/image`, {
        headers: { "X-Bokio-Company-Id": companyId },
      })
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          if (item.contentType === "application/pdf") {
            setPdfData(buffer);
          } else {
            const blob = new Blob([buffer], { type: item.contentType });
            setImageUrl(URL.createObjectURL(blob));
          }
        });
    }, index * 300);

    return () => clearTimeout(timer);
  }, [item, companyId, index]);

  const handleClick = async () => {
    const res = await fetch(`${API_BASE_URL}/api/receipts/${item.id}/image`, {
      headers: { "X-Bokio-Company-Id": companyId },
    });
    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: item.contentType });
    const file = new File([blob], item.originalFilename, {
      type: item.contentType,
    });
    onClick(file);
  };

  return (
    <div className="backlog-thumbnail" onClick={handleClick}>
      {pdfData ? (
        <Document file={{ data: pdfData }}>
          <Page pageNumber={1} width={150} />
        </Document>
      ) : imageUrl ? (
        <img src={imageUrl} alt="Kvitto" />
      ) : (
        <div className="backlog-thumbnail-placeholder">Laddar...</div>
      )}
    </div>
  );
}

function MailBacklogModal({
  onClose,
  onImageSelect,
  clerkUserId,
}: {
  onClose: () => void;
  onImageSelect: (file: File) => void;
  clerkUserId: string;
}) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/settings`, {
      headers: { "X-Clerk-User-Id": clerkUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        const id = data.companyId ?? "";
        setCompanyId(id);
        return fetch(`${API_BASE_URL}/api/receipts`, {
          headers: { "X-Bokio-Company-Id": id },
        });
      })
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [clerkUserId]);

  const handleSelect = (file: File) => {
    onImageSelect(file);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Mailkvitton</h2>
        {loading ? (
          <p className="backlog-loading">Hämtar kvitton...</p>
        ) : items.length === 0 ? (
          <p className="backlog-empty">Inga obokförda mailkvitton hittades.</p>
        ) : (
          <div className="backlog-grid">
            {items.map((item, index) => (
              <MailReceiptThumbnail
                key={item.id}
                item={item}
                companyId={companyId}
                onClick={handleSelect}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MailBacklogModal;
