import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function GuestJoinPage() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const handleJoin = () => {
    if (!meetingCode.trim()) return;
    navigate(`/${meetingCode.trim()}`);
  };

  const handleCreate = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/${newCode}`, {
      state: {
        created: true,
        meetingCode: newCode,
      },
    });
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="bg-black/70 p-8 rounded-2xl w-full max-w-md text-white space-y-6">
        <h2 className="text-3xl text-center font-semibold">Join as Guest</h2>

        <input
          type="text"
          placeholder="Enter Meeting Code"
          className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
        />

        <button
          onClick={handleJoin}
          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3 rounded-lg cursor-pointer"
        >
          Join Meeting
        </button>

        <button
          onClick={handleCreate}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg cursor-pointer"
        >
          Create New Meeting
        </button>

        <p className="text-gray-400 text-center text-sm">
          You are joining without login. History will not be saved.
        </p>
      </div>

      <div className="text-gray-400 text-sm text-center py-6">
        <Link to="/" className="hover:text-orange-400 transition">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default GuestJoinPage;
