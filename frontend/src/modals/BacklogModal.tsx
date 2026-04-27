import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Modal.css";
import "./BacklogModal.css";
import { API_BASE_URL } from "../config/api";
import { useAuthFetch } from "../hooks/useAuthFetch";

interface BacklogItem {
  id: string;
  contentType: string;
  description: string | null;
}

function toBase64DataUrl(buffer: ArrayBuffer, contentType: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return `data:${contentType};base64,${btoa(binary)}`;
}

function BacklogThumbnail({
  item,
  token,
  companyId,
  onClick,
}: {
  item: BacklogItem;
  token: string;
  companyId: string;
  onClick: (file: File, uploadId: string) => void;
}) {
  const queryClient = useQueryClient();

  const { data: buffer } = useQuery({
    queryKey: ["backlog-image", item.id],
    queryFn: () =>
      fetch(`${API_BASE_URL}/api/backlog/${item.id}/image`, {
        headers: {
          "X-Bokio-Token": token,
          "X-Bokio-Company-Id": companyId,
        },
      }).then((res) => res.arrayBuffer()),
    staleTime: Infinity,
  });

  // Base64 data URL avoids blob URL lifecycle issues (no cleanup, no Strict Mode revocation)
  const imageUrl = useMemo(() => {
    if (!buffer || item.contentType === "application/pdf") return null;
    return toBase64DataUrl(buffer, item.contentType);
  }, [buffer, item.contentType]);

  const handleClick = () => {
    const cached = queryClient.getQueryData<ArrayBuffer>(["backlog-image", item.id]);
    if (!cached) return;
    const blob = new Blob([cached], { type: item.contentType });
    const file = new File([blob], `receipt-${item.id}`, { type: item.contentType });
    onClick(file, item.id);
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

function BacklogModal({
  onClose,
  onImageSelect,
}: {
  onClose: () => void;
  onImageSelect: (file: File, uploadId: string) => void;
}) {
  const { user } = useUser();
  const authFetch = useAuthFetch();
  const token = localStorage.getItem("bokioToken") ?? "";

  const { data: settings } = useQuery({
    queryKey: ["user-settings", user?.id],
    queryFn: () =>
      authFetch(`${API_BASE_URL}/api/users/settings`).then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  const companyId = settings?.companyId ?? "";

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["backlog-items", companyId],
    queryFn: () =>
      fetch(`${API_BASE_URL}/api/backlog`, {
        headers: {
          "X-Bokio-Token": token,
          "X-Bokio-Company-Id": companyId,
        },
      }).then((res) => res.json()),
    enabled: !!companyId,
    staleTime: 60 * 1000,
  });

  const loading = !settings || isLoadingItems;

  const handleSelect = (file: File, uploadId: string) => {
    onImageSelect(file, uploadId);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Kvittobacklog</h2>
        {loading ? (
          <p className="backlog-loading">Hämtar kvitton...</p>
        ) : items.length === 0 ? (
          <p className="backlog-empty">Inga obokförda kvitton hittades.</p>
        ) : (
          <div className="backlog-grid">
            {items.map((item: BacklogItem) => (
              <BacklogThumbnail
                key={item.id}
                item={item}
                token={token}
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

export default BacklogModal;
