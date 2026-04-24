import { useEffect, useState } from "react";
import "./AccountingModal.css";
import accounts from "../data/accounts";
import {
  formatAmount,
  formatAmountOnBlur,
  parseAmount,
} from "../utils/formatAmount";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

interface JournalItem {
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

function AccountingModal({
  image,
  onClose,
}: {
  image: File;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<JournalItem[]>(initialItems);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/users/settings`)
      .then((res) => res.json())
      .then((data) => setCompanyId(data.companyId ?? ""));
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

  const [loading, setLoading] = useState(false);

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
      formData.append("image", image);

      const response = await fetch(`${API_URL}/accounting/submit-receipt`, {
        method: "POST",
        headers: {
          "X-Bokio-Token": token,
          "X-Bokio-Company-Id": companyId,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Bokföring misslyckades");
      }

      toast.success("Kvitto bokfört!");
      onClose();
    } catch {
      toast.error("Något gick fel, försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <img
          className="receipt-photo"
          src={URL.createObjectURL(image)}
          alt="Kvitto"
        />

        <input
          type="text"
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>Konto</th>
              <th>Kontonamn</th>
              <th>Debet</th>
              <th>Kredit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className={item.placeholder ? "placeholder-row" : ""}
                onClick={() => item.placeholder && activateRow(index)}
                onBlur={() => handleRowBlur(index)}
              >
                <td>
                  <input
                    type="text"
                    maxLength={4}
                    value={item.account}
                    onFocus={() => item.placeholder && activateRow(index)}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].account = e.target.value;
                      setItems(updated);
                    }}
                  />
                </td>
                <td>{accounts[item.account] ?? "—"}</td>
                <td>
                  <input
                    type="text"
                    value={item.debit}
                    onFocus={() => item.placeholder && activateRow(index)}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].debit = formatAmount(e.target.value);
                      setItems(updated);
                    }}
                    onBlur={(e) => {
                      const updated = [...items];
                      updated[index].debit = formatAmountOnBlur(e.target.value);
                      setItems(updated);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.credit}
                    onFocus={() => item.placeholder && activateRow(index)}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].credit = formatAmount(e.target.value);
                      setItems(updated);
                    }}
                    onBlur={(e) => {
                      const updated = [...items];
                      updated[index].credit = formatAmountOnBlur(
                        e.target.value,
                      );
                      setItems(updated);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <strong>Summa</strong>
              </td>
              <td>
                <strong>
                  {formatAmountOnBlur(String(totalDebit).replace(".", ","))}
                </strong>
              </td>
              <td>
                <strong>
                  {formatAmountOnBlur(String(totalCredit).replace(".", ","))}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>

        <button onClick={onClose}>Stäng</button>

        {isBalanced && (
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Bokför..." : "Bokför"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AccountingModal;
