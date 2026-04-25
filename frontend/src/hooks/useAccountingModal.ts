import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { compressImage } from "../utils/compressImage";
import { parseAmount, formatAmountOnBlur } from "../utils/formatAmount";
import accounts from "../data/accounts";
import { API_BASE_URL } from "../config/api";

export interface JournalItem {
  account: string;
  debit: string;
  credit: string;
  placeholder?: boolean;
}

const initialItems: JournalItem[] = [
  { account: "2890", debit: "", credit: "" },
  { account: "5460", debit: "", credit: "" },
  { account: "", debit: "", credit: "", placeholder: true },
];

function buildAccountPlan(): string {
  return Object.entries(accounts)
    .map(([number, name]) => `${number}: ${name}`)
    .join("\n");
}

export function useAccountingModal(
  image: File,
  clerkUserId: string,
  onClose: () => void,
) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<JournalItem[]>(initialItems);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const hasAnalyzed = useRef(false);
  const imageRef = useRef(image);
  const clerkUserIdRef = useRef(clerkUserId);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/settings`, {
      headers: { "X-Clerk-User-Id": clerkUserId },
    })
      .then((res) => res.json())
      .then((data) => setCompanyId(data.companyId ?? ""));
  }, [clerkUserId]);

  useEffect(() => {
    const analyze = async () => {
      if (hasAnalyzed.current) return;
      hasAnalyzed.current = true;
      setSuggesting(true);
      try {
        const formData = new FormData();
        const compressed = await compressImage(imageRef.current);
        formData.append("image", compressed, "receipt.jpg");
        formData.append("accountPlan", buildAccountPlan());

        const response = await fetch(`${API_BASE_URL}/api/accounting/analyze`, {
          method: "POST",
          headers: { "X-Clerk-User-Id": clerkUserIdRef.current },
          body: formData,
        });

        if (response.status === 204) return;

        const suggestion = await response.json();
        setTitle(suggestion.title ?? "");
        setDate(suggestion.date ?? "");
        setItems([
          ...suggestion.items.map(
            (item: { account: number; debit: number; credit: number }) => ({
              account: String(item.account),
              debit:
                item.debit > 0
                  ? formatAmountOnBlur(String(item.debit).replace(".", ","))
                  : "",
              credit:
                item.credit > 0
                  ? formatAmountOnBlur(String(item.credit).replace(".", ","))
                  : "",
            }),
          ),
          { account: "", debit: "", credit: "", placeholder: true },
        ]);
      } catch {
        toast.error("Kunde inte analysera kvittot.");
      } finally {
        setSuggesting(false);
      }
    };

    analyze();
  }, []);

  const activeItems = items.filter((item) => !item.placeholder);

  const totalDebit = items.reduce(
    (sum, item) => sum + parseAmount(item.debit),
    0,
  );
  const totalCredit = items.reduce(
    (sum, item) => sum + parseAmount(item.credit),
    0,
  );
  const isBalanced =
    Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const formattedTotalDebit = formatAmountOnBlur(
    String(totalDebit).replace(".", ","),
  );
  const formattedTotalCredit = formatAmountOnBlur(
    String(totalCredit).replace(".", ","),
  );

  const activateRow = (index: number) => {
    const updated = [...items];
    updated[index].placeholder = false;
    updated.push({ account: "", debit: "", credit: "", placeholder: true });
    setItems(updated);
  };

  const handleRowBlur = (index: number) => {
    const item = items[index];
    if (!item.placeholder && !item.account && !item.debit && !item.credit) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bokioToken") ?? "";
      const formData = new FormData();
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              title,
              date,
              items: activeItems.map((item) => ({
                account: parseInt(item.account),
                debit: parseAmount(item.debit),
                credit: parseAmount(item.credit),
              })),
            }),
          ],
          { type: "application/json" },
        ),
      );
      const compressed = await compressImage(image);
      formData.append("image", compressed, "receipt.jpg");

      const response = await fetch(
        `${API_BASE_URL}/api/accounting/submit-receipt`,
        {
          method: "POST",
          headers: {
            "X-Bokio-Token": token,
            "X-Bokio-Company-Id": companyId,
            "X-Clerk-User-Id": clerkUserId,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Bokföring misslyckades");

      toast.success("Kvitto bokfört!");
      onClose();
    } catch {
      toast.error("Något gick fel, försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    items,
    setItems,
    isBalanced,
    loading,
    totalDebit: formattedTotalDebit,
    totalCredit: formattedTotalCredit,
    activateRow,
    handleRowBlur,
    handleSubmit,
    suggesting,
  };
}
