import { useEffect, useState } from "react";
import "./App.css";

interface User {
  email: string;
  companyId: string | null;
  customPrompt: string | null;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        return res.json();
      })
      .then((data: User[]) => setUsers(data));
  }, []);

  return (
    <>
      <h1>Welcome to the Receipt Handler!</h1>
      <p>This is a simple receipt handler application.</p>
      <ul>
        {users.map((user) => (
          <li key={user.email}>{user.email}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
