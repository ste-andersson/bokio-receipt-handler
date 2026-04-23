import "./AccountingModal.css";

function AccountingModal({
  image,
  onClose,
}: {
  image: File;
  onClose: () => void;
}) {
  return (
    <div>
      <h1>Bokför kvittot</h1>
      <img
        className="receipt-photo"
        src={URL.createObjectURL(image)}
        alt="Kvitto"
      />
      <button onClick={onClose}>Stäng</button>
    </div>
  );
}

export default AccountingModal;
