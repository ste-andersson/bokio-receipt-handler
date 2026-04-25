import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./BacklogModal.css";
import { API_BASE_URL } from "../config/api";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BacklogItem {
  id: string;
  contentType: string;
  description: string | null;
}

function BacklogThumbnail({
  item,
  token,
  companyId,
  onClick,
  index,
}: {
  item: BacklogItem;
  token: string;
  companyId: string;
  onClick: (file: File, uploadId: string) => void;
  index: number;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/backlog/${item.id}/image`, {
        headers: {
          "X-Bokio-Token": token,
          "X-Bokio-Company-Id": companyId,
        },
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
    }, index * 600);

    return () => clearTimeout(timer);
  }, [item, token, companyId, index]);

  const handleClick = async () => {
    const res = await fetch(`${API_BASE_URL}/api/backlog/${item.id}/image`, {
      headers: {
        "X-Bokio-Token": token,
        "X-Bokio-Company-Id": companyId,
      },
    });
    const buffer = await res.arrayBuffer();
    const blob = new Blob([buffer], { type: item.contentType });
    const file = new File([blob], `receipt-${item.id}`, {
      type: item.contentType,
    });
    onClick(file, item.id);
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

function BacklogModal({
  onClose,
  onImageSelect,
  clerkUserId,
}: {
  onClose: () => void;
  onImageSelect: (file: File, uploadId: string) => void;
  clerkUserId: string;
}) {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("bokioToken") ?? "";
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/settings`, {
      headers: { "X-Clerk-User-Id": clerkUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompanyId(data.companyId ?? "");
        return fetch(`${API_BASE_URL}/api/backlog`, {
          headers: {
            "X-Bokio-Token": token,
            "X-Bokio-Company-Id": data.companyId ?? "",
          },
        });
      })
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, [clerkUserId, token]);

  const handleSelect = (file: File, uploadId: string) => {
    onImageSelect(file, uploadId);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Kvittobacklog</h2>
        {loading ? (
          <p className="backlog-loading">Hämtar kvitton...</p>
        ) : items.length === 0 ? (
          <p className="backlog-empty">Inga obokförda kvitton hittades.</p>
        ) : (
          <div className="backlog-grid">
            {items.map((item, index) => (
              <BacklogThumbnail
                key={item.id}
                item={item}
                token={token}
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

export default BacklogModal;
