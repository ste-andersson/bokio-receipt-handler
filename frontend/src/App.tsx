import { useEffect, useState } from "react";
import "./App.css";

interface User {
  email: string;
  companyId: string | null;
  customPrompt: string | null;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/users`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: User[]) => setUsers(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <>
      <h1>Välkommen till kvittohanteraren</h1>
      <p>Du är inloggad som:.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.email}>{user.email}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
