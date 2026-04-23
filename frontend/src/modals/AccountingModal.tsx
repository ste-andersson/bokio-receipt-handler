import { useState } from "react";
import "./AccountingModal.css";
import accounts from "../data/accounts";

interface JournalItem {
  account: string;
  debit: string;
  credit: string;
}

const initialItems: JournalItem[] = [
  { account: "2890", debit: "", credit: "" },
  { account: "5460", debit: "", credit: "" },
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
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    maxLength={4}
                    value={item.account}
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
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].debit = e.target.value;
                      setItems(updated);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.credit}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].credit = e.target.value;
                      setItems(updated);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={onClose}>Stäng</button>
      </div>
    </div>
  );
}

export default AccountingModal;
