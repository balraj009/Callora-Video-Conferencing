import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function HistoryPage() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetingHistory, setMeetingHistory] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const isGuest = !localStorage.getItem("token");

    if (isGuest) {
      toast.error("Please login to view your meeting history.");
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        console.log("Fetched History:", history);

        if (Array.isArray(history)) {
          setMeetingHistory(history);
        } else if (Array.isArray(history?.meetings)) {
          setMeetingHistory(history.meetings);
        } else {
          setMeetingHistory([]);
        }
      } catch (error) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Uh-oh! An error occurred while fetching history.";
        toast.error(errorMsg);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center py-6 px-3 sm:px-4"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="bg-black/70 backdrop-blur-xl rounded-2xl w-full max-w-4xl p-6 sm:p-8 border border-gray-700 shadow-lg">
        <div className="text-gray-400 text-sm text-center pb-5">
          <Link to="/home" className="hover:text-orange-400 transition">
            ← Back to Home
          </Link>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
          Your Meeting History
        </h2>

        {meetingHistory.length === 0 && (
          <div className="text-center text-gray-300 py-10">
            <p className="text-lg sm:text-xl">No meetings found.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded-lg font-semibold w-full sm:w-auto"
            >
              Go to Home
            </button>
          </div>
        )}

        <div className="space-y-4">
          {meetingHistory.map((item) => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-900/70 border border-gray-700 rounded-xl p-5 hover:bg-gray-900 transition"
            >
              <div className="text-gray-300">
                <p className="text-base sm:text-lg font-semibold text-white">
                  Meeting ID:{" "}
                  <span className="text-orange-400">{item.meetingId}</span>
                </p>
                <p className="text-sm sm:text-base">
                  Date: {formatDate(item.date)}
                </p>
                <p className="text-sm sm:text-base">
                  Time: {formatTime(item.date)}
                </p>
              </div>

              <button
                onClick={() => navigate(`/${item.meetingId}`)}
                className="bg-orange-500 hover:bg-orange-600 text-black px-5 py-2 rounded-lg font-semibold w-full sm:w-auto cursor-pointer"
              >
                Join Again
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
