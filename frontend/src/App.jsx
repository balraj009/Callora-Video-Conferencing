import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoMeetPage from "./pages/VideoMeetPage";
import HomePage from "./pages/HomePage";
import GuestJoinPage from "./pages/GuestJoinPage";
import HistoryPage from "./pages/HistoryPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPage from "./pages/PrivacyPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          className="!p-2"
          toastClassName="bg-gray-900 text-white border border-orange-500 rounded-xl shadow-lg md:!w-96 w-72"
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthenticationPage />} />
          <Route path="/guest" element={<GuestJoinPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/:url" element={<VideoMeetPage />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
