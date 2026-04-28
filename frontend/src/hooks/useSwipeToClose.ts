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

    let startY = 0;
    let dragging = false;

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
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging) return;
      dragging = false;
      const delta = e.changedTouches[0].clientY - startY;
      if (delta > 120) {
        el.style.transition = "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)";
        el.style.transform = "translateY(110%)";
        setTimeout(() => onCloseRef.current(), 240);
      } else {
        el.style.transition = "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)";
        el.style.transform = "translateY(0)";
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
