import { Link } from "react-router-dom";

function HelpPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white relative"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative max-w-3xl mx-auto px-6 sm:px-12 py-12">
        <h1 className="text-4xl font-bold text-orange-400 mb-6 text-center drop-shadow-lg">
          Help & Support
        </h1>

        <p className="text-gray-300 mb-6 text-lg text-center leading-relaxed">
          Welcome to the Callora Help Center. Find answers to common questions
          and guidance for using the platform smoothly.
        </p>

        <div className="space-y-6">
          {[
            {
              title: "How do I join a meeting?",
              text: `Enter a valid meeting code on the homepage and click the Join button.`,
            },
            {
              title: "How do I create a new meeting?",
              text: `Click the Create New button. A unique meeting code is generated instantly.`,
            },
            {
              title: "Why is my camera/mic not working?",
              text: `Ensure your browser has permission to access your camera and microphone.`,
            },
            {
              title: "Does Callora save recordings?",
              text: `No, Callora does not store or record your calls. Everything is live only.`,
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900/70 p-5 rounded-xl border border-gray-700 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-orange-300 mb-2">
                {faq.title}
              </h2>
              <p className="text-gray-400">{faq.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 bg-gray-900/70 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-orange-300 mb-2">
            Need More Help?
          </h2>
          <p className="text-gray-400 mb-2">
            If you’re facing any issues or have suggestions, feel free to
            contact us.
          </p>
          <p className="text-gray-300">
            Email: <span className="text-orange-400">support@callora.com</span>
          </p>
        </div>

        <div className="text-gray-400 text-sm text-center py-6">
          <Link to="/auth" className="hover:text-orange-400 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
