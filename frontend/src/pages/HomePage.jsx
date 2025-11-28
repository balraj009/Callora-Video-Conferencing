import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import withAuth from "../utils/withAuth";
import "react-toastify/dist/ReactToastify.css";

function HomePage() {
  const navigate = useNavigate();
  const { addToUserHistory } = useContext(AuthContext);

  const [meetingCode, setMeetingCode] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode.trim());
    navigate(`/${meetingCode.trim()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div
      className="min-h-screen w-screen bg-no-repeat bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <nav className="flex items-center justify-between px-6 sm:px-8 md:px-12 py-4 relative z-10">
        <div>
          <img
            src="/callora-white.png"
            alt="Callora Logo"
            className="h-18 sm:h-22 md:h-25"
          />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none cursor-pointer"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6 text-white font-medium">
          <Link to="/about" className="hover:underline">
            About Developer
          </Link>
          <button
            onClick={() => navigate("/history")}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition cursor-pointer"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="bg-orange-400 text-black px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="flex flex-col md:hidden items-center gap-4 text-white font-medium bg-black/70 py-4 px-6">
          <Link to="/about" className="hover:underline">
            About Developer
          </Link>
          <button
            onClick={() => navigate("/history")}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition cursor-pointer"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="bg-orange-400 text-black px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}

      <section className="flex-grow flex items-center justify-center px-6 sm:px-12 md:px-20">
        <div className="w-full max-w-xl bg-gray-900 rounded-2xl p-10 sm:p-12 flex flex-col items-center text-white space-y-6 shadow-xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-white px-4">
            Start a <span className="text-orange-400">Call</span> Instantly
          </h1>

          <p className="text-gray-400 text-center text-lg sm:text-xl px-4">
            Connect with friends, family, or colleagues anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full mt-4">
            <input
              type="text"
              placeholder="Enter Meeting Code"
              className="flex-grow px-5 py-3 rounded-lg bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm w-full sm:w-auto transition-all duration-200"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <button
              onClick={handleJoinVideoCall}
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-lg shadow-md w-full sm:w-auto transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              Join
            </button>
            <button
              onClick={async () => {
                const newCode = Math.random()
                  .toString(36)
                  .substring(2, 8)
                  .toUpperCase();
                
                await addToUserHistory(newCode);

                navigate(`/${newCode}`, {
                  state: {
                    created: true,
                    meetingCode: newCode,
                  },
                });
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md w-full sm:w-auto transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              Create New
            </button>
          </div>

          <p className="text-gray-500 text-sm text-center mt-2">
            Use a code to join a meeting or create a new one instantly.
          </p>
        </div>
      </section>
    </div>
  );
}

export default withAuth(HomePage);
