import { useCallback, useEffect, useRef } from "react";

const MOBILE_QUERY = "(max-width: 760px)";

export function useAnimatedClose(
  contentRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
): () => void {
  const onCloseRef = useRef(onClose);
  const closing = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
    closing.current = false;
  }, [onClose]);

  return useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = contentRef.current;
    if (el && window.matchMedia(MOBILE_QUERY).matches) {
      const overlay = el.parentElement as HTMLElement | null;
      if (overlay) {
        overlay.style.animation = "none";
        overlay.style.transition = "background 0.7s ease, backdrop-filter 0.7s ease";
        overlay.style.background = "rgba(34, 34, 34, 0)";
        overlay.style.backdropFilter = "blur(0px)";
      }
      el.style.transition = "transform 0.7s cubic-bezier(0.32, 0.72, 0, 1)";
      el.style.transform = "translateY(110%)";
      setTimeout(() => onCloseRef.current(), 700);
    } else {
      onCloseRef.current();
    }
  }, [contentRef]);
}
