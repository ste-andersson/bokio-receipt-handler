import { useEffect, useRef } from "react";

export function useSwipeToClose(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const overlay = el.parentElement as HTMLElement | null;

    let startY = 0;
    let dragging = false;

    const setOverlayBg = (alpha: number, transition?: string) => {
      if (!overlay) return;
      overlay.style.animation = "none";
      overlay.style.transition = transition ?? "none";
      overlay.style.background = `rgba(34, 34, 34, ${alpha.toFixed(3)})`;
      overlay.style.backdropFilter = `blur(${((3 * alpha) / 0.45).toFixed(1)}px)`;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      dragging = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (el.scrollTop > 0) return;
      const delta = e.touches[0].clientY - startY;
      if (!dragging) {
        if (delta < 8) return;
        dragging = true;
      }
      if (delta > 0) {
        e.preventDefault();
        el.style.transition = "none";
        el.style.transform = `translateY(${delta}px)`;
        const alpha = 0.45 * Math.max(0, 1 - delta / 300);
        setOverlayBg(alpha);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging) return;
      dragging = false;
      const delta = e.changedTouches[0].clientY - startY;
      if (delta > 120) {
        el.style.transition = "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)";
        el.style.transform = "translateY(110%)";
        setOverlayBg(0, "background 0.24s ease, backdrop-filter 0.25s ease");
        setTimeout(() => onCloseRef.current(), 240);
      } else {
        el.style.transition = "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)";
        el.style.transform = "translateY(0)";
        setOverlayBg(0.45, "background 0.3s ease, backdrop-filter 0.3s ease");
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref]);
}
