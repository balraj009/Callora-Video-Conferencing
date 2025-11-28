import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleGoToLogin = () => {
    navigate("/auth?mode=login ");
  };

  const handleGoToRegister = () => {
    navigate("/auth?mode=register");
  };

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/home");
    } else {
      navigate("/auth");
    }
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
          <a
            onClick={() => navigate("/guest")}
            className="hover:underline cursor-pointer"
          >
            Join as Guest
          </a>

          <a
            onClick={() => navigate("/about")}
            className="hover:underline cursor-pointer"
          >
            About Developer
          </a>

          {!token && (
            <>
              <button
                onClick={handleGoToLogin}
                className="text-white hover:underline cursor-pointer"
              >
                Login
              </button>

              <button
                onClick={handleGoToRegister}
                className="bg-orange-400 text-black px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {isOpen && (
        <div className="flex flex-col md:hidden items-center gap-4 text-white font-medium bg-black/70 py-4 px-6">
          <a
            onClick={() => navigate("/guest")}
            className="hover:underline cursor-pointer"
          >
            Join as Guest
          </a>

          <a
            onClick={() => navigate("/about")}
            className="hover:underline cursor-pointer"
          >
            About Developer
          </a>

          {!token && (
            <>
              <button
                onClick={handleGoToLogin}
                className="text-white hover:underline cursor-pointer"
              >
                Login
              </button>

              <button
                onClick={handleGoToRegister}
                className="bg-orange-400 text-black px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </div>
      )}

      <section className="flex-grow flex items-center justify-center px-6 sm:px-12 md:px-20">
        <div className="max-w-[80%] w-full flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left text-white space-y-6 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-tight">
              <span className="text-orange-400">Connect</span> with your{" "}
              <br className="hidden sm:block" /> Loved Ones
            </h1>
            <p className="text-lg text-gray-300 sm:text-xl">
              Cover a distance by Callora video call
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-black px-8 py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Get Started
            </button>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src="/video-call.png"
              alt="Video Call Illustration"
              className="w-64 sm:w-80 md:w-[32rem] drop-shadow-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
