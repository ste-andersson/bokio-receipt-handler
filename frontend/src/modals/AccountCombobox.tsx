import { useEffect, useRef, useState } from "react";
import accounts from "../data/accounts";
import "./AccountCombobox.css";

interface Props {
  value: string;
  onChange: (account: string) => void;
}

export function AccountCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = Object.entries(accounts).filter(([num, name]) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return num.includes(q) || name.toLowerCase().includes(q);
  });

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        left: rect.left + rect.width / 2,
      });
    }
    setFilter("");
    setOpen(true);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => filterRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="account-combobox-trigger"
        onClick={handleOpen}
        type="button"
      >
        {value ? (
          <>
            <span className="account-number">{value}</span>
            <span className="account-name">{accounts[value] ?? "—"}</span>
          </>
        ) : (
          <span className="placeholder-text">Välj konto</span>
        )}
      </button>
      {open && (
        <div ref={dropdownRef} className="account-dropdown" style={dropdownStyle}>
          <input
            ref={filterRef}
            className="account-filter-input"
            type="text"
            placeholder="Sök konto..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <ul className="account-options">
            {filtered.map(([num, name]) => (
              <li key={num}>
                <button
                  type="button"
                  className={`account-option${num === value ? " account-option--selected" : ""}`}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(num);
                    setOpen(false);
                  }}
                >
                  <span className="account-option-number">{num}</span>
                  <span className="account-option-name">{name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="account-option-empty">Inga konton hittades</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
