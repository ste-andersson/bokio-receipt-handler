import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StartPage from "./StartPage";
import "./App.css";

function App() {
  return (
    <>
      <StartPage />
      <ToastContainer />
    </>
  );
}

export default App;
