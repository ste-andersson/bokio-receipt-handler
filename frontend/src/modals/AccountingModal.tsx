import "./AccountingModal.css";
import accounts from "../data/accounts";
import { formatAmount, formatAmountOnBlur } from "../utils/formatAmount";
import { useAccountingModal } from "../hooks/useAccountingModal";

function AccountingModal({
  image,
  onClose,
  clerkUserId,
}: {
  image: File;
  onClose: () => void;
  clerkUserId: string;
}) {
  const {
    title,
    setTitle,
    date,
    setDate,
    items,
    setItems,
    loading,
    totalDebit,
    totalCredit,
    isBalanced,
    activateRow,
    handleRowBlur,
    handleSubmit,
  } = useAccountingModal(image, clerkUserId, onClose);

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
                <strong>{totalDebit}</strong>
              </td>
              <td>
                <strong>{totalCredit}</strong>
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
