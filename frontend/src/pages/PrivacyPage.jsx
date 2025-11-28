import { Link } from "react-router-dom";

function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white relative"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative max-w-3xl mx-auto px-6 sm:px-12 py-12">
        <h1 className="text-4xl font-bold text-orange-400 mb-6 text-center drop-shadow-lg">
          Privacy Policy
        </h1>

        <p className="text-gray-300 text-lg mb-6 text-center leading-relaxed">
          Your privacy is important to us. This policy explains how Callora
          handles your data.
        </p>

        <div className="space-y-6">
          {[
            {
              title: "1. Information We Collect",
              text: `We only collect essential info:
• Your name (display in meeting)
• Meeting history
• Camera & mic permissions controlled by browser`,
            },
            {
              title: "2. No Call Recording",
              text: `Callora never records or stores your audio/video calls. Communication is real-time only.`,
            },
            {
              title: "3. How We Use Your Data",
              text: `• Showing your name in meetings
• Managing basic meeting history
• Improving user experience`,
            },
            {
              title: "4. Third-Party Sharing",
              text: `We never sell or share your data with any third parties.`,
            },
            {
              title: "5. Security",
              text: `Your information is encrypted and protected using industry-standard security practices.`,
            },
            {
              title: "6. Policy Updates",
              text: `We may update this policy. Continued use means you accept the latest version.`,
            },
          ].map((section, index) => (
            <div
              key={index}
              className="bg-gray-900/70 p-5 rounded-xl border border-gray-700 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-orange-300 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-400 whitespace-pre-line">
                {section.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 bg-gray-900/70 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-orange-300 mb-2">
            Have Questions?
          </h2>
          <p className="text-gray-400 mb-2">Reach out anytime:</p>
          <p className="text-gray-300">
            Email: <span className="text-orange-400">privacy@callora.com</span>
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

export default PrivacyPage;
