import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Modal.css";
import "./BacklogModal.css";
import { API_BASE_URL } from "../config/api";

interface ReceiptItem {
  id: number;
  contentType: string;
  originalFilename: string;
  receivedAt: string;
}

function toBase64DataUrl(buffer: ArrayBuffer, contentType: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return `data:${contentType};base64,${btoa(binary)}`;
}

function MailReceiptThumbnail({
  item,
  companyId,
  onClick,
}: {
  item: ReceiptItem;
  companyId: string;
  onClick: (file: File) => void;
}) {
  const queryClient = useQueryClient();

  const { data: buffer } = useQuery({
    queryKey: ["receipt-image", item.id],
    queryFn: () =>
      fetch(`${API_BASE_URL}/api/receipts/${item.id}/image`, {
        headers: { "X-Bokio-Company-Id": companyId },
      }).then((res) => res.arrayBuffer()),
    staleTime: Infinity,
  });

  // Base64 data URL avoids blob URL lifecycle issues (no cleanup, no Strict Mode revocation)
  const imageUrl = useMemo(() => {
    if (!buffer || item.contentType === "application/pdf") return null;
    return toBase64DataUrl(buffer, item.contentType);
  }, [buffer, item.contentType]);

  const handleClick = () => {
    const cached = queryClient.getQueryData<ArrayBuffer>(["receipt-image", item.id]);
    if (!cached) return;
    const blob = new Blob([cached], { type: item.contentType });
    const file = new File([blob], item.originalFilename, { type: item.contentType });
    onClick(file);
  };

  return (
    <div className="backlog-thumbnail" onClick={handleClick}>
      {buffer && item.contentType === "application/pdf" ? (
        // slice(0) gives pdfjs a fresh copy to transfer — keeps the cached buffer intact
        <Document file={{ data: buffer.slice(0) }}>
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
  const { data: settings } = useQuery({
    queryKey: ["user-settings", clerkUserId],
    queryFn: () =>
      fetch(`${API_BASE_URL}/api/users/settings`, {
        headers: { "X-Clerk-User-Id": clerkUserId },
      }).then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  const companyId = settings?.companyId ?? "";

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["receipt-items", companyId],
    queryFn: () =>
      fetch(`${API_BASE_URL}/api/receipts`, {
        headers: { "X-Bokio-Company-Id": companyId },
      }).then((res) => res.json()),
    enabled: !!companyId,
    staleTime: 60 * 1000,
  });

  const loading = !settings || isLoadingItems;

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
            {items.map((item: ReceiptItem) => (
              <MailReceiptThumbnail
                key={item.id}
                item={item}
                companyId={companyId}
                onClick={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MailBacklogModal;
