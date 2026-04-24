import { useUser, Show, SignInButton, UserButton } from "@clerk/react";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StartPage from "./StartPage";
import "./App.css";

function App() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      }),
    });
  }, [user]);

  return (
    <>
      <header>
        <Show when="signed-in">
          Signed in as: <UserButton />
        </Show>
      </header>
      <ToastContainer />
      <Show when="signed-out">
        <SignInButton />
      </Show>
      <Show when="signed-in">
        <StartPage />
      </Show>
    </>
  );
}

export default App;
