"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Dialog({ children, titleId, label, className = "modal-backdrop", onClose }: {
  children: ReactNode; titleId?: string; label?: string; className?: string; onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = ref.current;
    if (!root) return;
    const parent = root.parentElement;
    const siblings = parent ? Array.from(parent.children).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== root) : [];
    const oldInert = siblings.map((node) => node.inert);
    siblings.forEach((node) => { node.inert = true; });
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter((node) => node.getClientRects().length > 0);
    (focusable()[0] ?? root).focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); root?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      siblings.forEach((node, index) => { node.inert = oldInert[index]; });
      document.body.style.overflow = oldOverflow;
      if (previous?.isConnected) previous.focus();
      else {
        const fallback = document.getElementById("recommendations-title") ?? document.querySelector("h1");
        if (fallback) { fallback.tabIndex = -1; fallback.focus(); }
      }
    };
  }, []);
  return <div ref={ref} tabIndex={-1} className={className} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-label={label}>{children}</div>;
}
