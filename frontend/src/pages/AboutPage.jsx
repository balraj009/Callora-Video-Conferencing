import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white px-6 sm:px-12 py-12"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="min-h-screen w-full backdrop-blur-md bg-black/60 px-6 sm:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-orange-400 mb-6 text-center drop-shadow-lg">
            About the Developer
          </h1>

          <p className="text-gray-300 text-lg mb-10 text-center leading-relaxed">
            Meet the mind behind{" "}
            <span className="text-orange-400 font-semibold">Callora</span> - a
            developer passionate about building modern, real-time communication
            experiences with smooth UI and powerful backend architecture.
          </p>

          <div className="bg-gray-900/70 p-8 rounded-2xl border border-gray-700 shadow-xl space-y-6">
            <div className="flex justify-center">
              <img
                src="/developer.jpg"
                alt="Developer"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-400 shadow-lg"
              />
            </div>

            <h2 className="text-3xl font-bold text-orange-300 text-center">
              Balraj Choure
            </h2>

            <p className="text-center text-gray-5400 text-md">
              Crafting Real-Time, High-Performance Web Experiences
            </p>

            <p className="text-center text-gray-400 text-lg font-semibold">
              Full-Stack Developer • MERN • WebRTC • Real-Time Systems
            </p>

            <div className="flex justify-center gap-6 mt-4">
              <a
                href="https://github.com/balraj009"
                target="_blank"
                className="text-orange-400 hover:text-orange-300 transition text-xl"
              >
                <i class="ri-github-fill"></i> GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/balraj-choure-621a58297/"
                target="_blank"
                className="text-orange-400 hover:text-orange-300 transition text-xl"
              >
                <i class="ri-linkedin-box-fill"></i> LinkedIn
              </a>

              <a
                href="#"
                target="_blank"
                className="text-orange-400 hover:text-orange-300 transition text-xl"
              >
                <i class="ri-earth-fill"></i> Portfolio
              </a>
            </div>

            <p className="text-gray-300 leading-relaxed text-[17px]">
              I am a dedicated Full-Stack Developer with a strong focus on
              real-time communication platforms. Building Callora allowed me to
              explore deep concepts of peer-to-peer video calling, WebRTC
              pipelines, and socket-based signaling systems.
              <br />
              <br />
              My development approach mixes clean UI/UX with scalable backend
              architecture - creating apps that are fast, intuitive, and built
              for real-world performance.
            </p>

            <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">
                Tech Stack & Expertise
              </h3>

              <ul className="text-gray-400 space-y-2">
                <li>• React.js (UI, State, Custom Hooks)</li>
                <li>• Node.js & Express (REST APIs, Auth, Scaling)</li>
                <li>• MongoDB (Schema Design, Indexing)</li>
                <li>• TailwindCSS (Modern, Responsive UI)</li>
                <li>• WebRTC (P2P media streams, STUN/TURN)</li>
                <li>• Socket.IO (real-time signaling & room control)</li>
                <li>• Peer-to-Peer Video/Audio flow architecture</li>
              </ul>
            </div>

            <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">
                How Callora Video Meetings Work
              </h3>

              <p className="text-gray-300 leading-relaxed">
                • A meeting code is generated for signaling and connecting
                users.
                <br />• WebRTC establishes secure peer-to-peer communication.
                <br />• STUN/TURN servers ensure connectivity behind firewalls.
                <br />• Audio/Video streams flow directly between users.
                <br />• Socket.IO manages joins, leaves, offers, answers & ICE
                candidates.
                <br />
                <br />
                This architecture ensures low latency, privacy, and ultra-smooth
                calling.
              </p>
            </div>
          </div>

          <div className="text-gray-400 text-sm text-center py-6">
            <Link to="/" className="hover:text-orange-400 transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
