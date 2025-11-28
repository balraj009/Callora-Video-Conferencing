import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { handleLogin, handleRegister } = useContext(AuthContext);

  const navigae = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (!isLogin && password !== confirmPassword) {
        toast.error("Oops! Your passwords don’t match.");
        return;
      }

      if (isLogin) {
        const msg = await handleLogin(email.trim(), password);
        toast.success("Great! You’re now logged in");
      } else {
        const msg = await handleRegister(
          name.trim(),
          email.trim(),
          password,
          confirmPassword
        );
        toast.success("Hooray! Your account is ready.");
        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Uh-oh! An error occurred.";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigae("/home");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");

    if (mode == "register") {
      setIsLogin(false);
    } else if (mode == "login") {
      setIsLogin(true);
    }
  }, [location.search]);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-no-repeat bg-cover bg-center flex flex-col"
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
          <Link to="/help" className="hover:underline">
            Help
          </Link>
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
        </div>
      </nav>

      {isOpen && (
        <div className="flex flex-col md:hidden items-center gap-4 text-white font-medium bg-black/70 py-4 px-6">
          <Link to="/about" className="hover:underline">
            About Developer
          </Link>
          <Link to="/help" className="hover:underline">
            Help
          </Link>
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
        </div>
      )}

      <div className="flex-grow flex flex-col items-center justify-center px-6">
        <div className="bg-black/70 backdrop-blur-lg rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-lg border border-gray-700 mt-6">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 rounded-l-lg font-semibold transition-all cursor-pointer ${
                isLogin
                  ? "bg-orange-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 rounded-r-lg font-semibold transition-all cursor-pointer ${
                !isLogin
                  ? "bg-orange-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <h2 className="text-white text-2xl sm:text-3xl font-semibold text-center mb-6">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h2>

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-2 rounded-lg transition cursor-pointer"
            >
              {isLogin ? "Login" : "Register"}
            </button>

            {isLogin && (
              <div className="text-center mt-4 text-gray-400">
                Don’t have an account?{" "}
                <span
                  onClick={() => setIsLogin(false)}
                  className="text-orange-400 cursor-pointer hover:underline"
                >
                  Register now
                </span>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="text-gray-400 text-sm text-center py-6">
        <Link to="/" className="hover:text-orange-400 transition">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AuthenticationPage;
