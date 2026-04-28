import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { compressImage } from "../utils/compressImage";
import { parseAmount, formatAmountOnBlur } from "../utils/formatAmount";
import accounts from "../data/accounts";
import { API_BASE_URL } from "../config/api";
import { useAuthFetch } from "./useAuthFetch";
import { useUser } from "@clerk/react";

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
  onClose: () => void,
  uploadId?: string,
  mailReceiptId?: number,
) {
  const authFetch = useAuthFetch();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<JournalItem[]>(initialItems);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  const hasAnalyzed = useRef(false);
  const imageRef = useRef(image);

  useEffect(() => {
    if (!user?.id) return;
    authFetch(`${API_BASE_URL}/api/users/settings`)
      .then((res) => res.json())
      .then((data) => {
        setCompanyId(data.companyId ?? "");
        setAiEnabled((data.aiProvider ?? "OPENAI") !== "OFF");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (aiEnabled === null || !aiEnabled) return;

    const analyze = async () => {
      if (hasAnalyzed.current) return;
      hasAnalyzed.current = true;
      setSuggesting(true);
      try {
        const formData = new FormData();
        const compressed = await compressImage(imageRef.current);
        formData.append("image", compressed, "receipt.jpg");
        formData.append("accountPlan", buildAccountPlan());

        const response = await authFetch(`${API_BASE_URL}/api/accounting/analyze`, {
          method: "POST",
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiEnabled]);

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
    Math.abs(totalDebit - totalCredit) < 0.01 &&
    totalDebit > 0 &&
    title.trim().length > 0;

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
              uploadId: uploadId ?? null,
            }),
          ],
          { type: "application/json" },
        ),
      );

      const compressed =
        image.type === "application/pdf" ? image : await compressImage(image);
      formData.append(
        "image",
        compressed,
        image.type === "application/pdf" ? "receipt.pdf" : "receipt.jpg",
      );

      const response = await authFetch(
        `${API_BASE_URL}/api/accounting/submit-receipt`,
        {
          method: "POST",
          headers: {
            "X-Bokio-Token": token,
            "X-Bokio-Company-Id": companyId,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Bokföring misslyckades");

      if (mailReceiptId !== undefined) {
        await authFetch(`${API_BASE_URL}/api/receipts/${mailReceiptId}`, {
          method: "DELETE",
          headers: { "X-Bokio-Company-Id": companyId },
        });
        queryClient.invalidateQueries({ queryKey: ["receipt-items", companyId] });
      }

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
