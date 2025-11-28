import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const serverUrl = `${import.meta.env.VITE_BASE_URL}`;

let connections = {};
let addedStreams = new Set();

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function VideoMeetPage() {
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState(false);
  let [screenSharing, setScreenSharing] = useState(false);
  let [screenSharingAvailable, setScreenSharingAvailable] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const [spotlightVideo, setSpotlightVideo] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const location = useLocation();
  const created = location.state?.created || false;
  const meetingCode = location.state?.meetingCode || "";

  const getPermissions = async () => {
    try {
      try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoPermission) {
          setVideoAvailable(true);
        }
      } catch {
        setVideoAvailable(false);
      }

      try {
        const audioPermission = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (audioPermission) {
          setAudioAvailable(true);
          audioPermission.getTracks().forEach((track) => track.stop());
        }
      } catch {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenSharingAvailable(true);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          setLocalStream(userMediaStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  useEffect(() => {
    getPermissions();

    return () => {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(connections).forEach((conn) => conn.close());
      addedStreams.clear();
    };
  }, []);

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = () => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width: 640,
      height: 480,
    });
    canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    } catch (error) {
      console.error("Error stopping previous stream.", error);
    }

    window.localStream = stream;
    setLocalStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      const senders = connections[id].getSenders();
      senders.forEach((sender) => {
        connections[id].removeTrack(sender);
      });

      stream.getTracks().forEach((track) => {
        connections[id].addTrack(track, stream);
      });

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((error) => {
            console.error("Error creating offer.", error);
          });
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          if (localVideoRef.current && localVideoRef.current.srcObject) {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          }
        } catch (error) {
          console.error("Error stopping media tracks.", error);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);

        window.localStream = blackSilence();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }

        for (let id in connections) {
          const senders = connections[id].getSenders();
          senders.forEach((sender) => {
            connections[id].removeTrack(sender);
          });

          window.localStream.getTracks().forEach((track) => {
            connections[id].addTrack(track, window.localStream);
          });

          connections[id].createOffer().then((description) => {
            connections[id]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription })
                );
              })
              .catch((error) => {
                console.error("Error creating offer.", error);
              });
          });
        }
      };
    });
  };

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((error) => {
          console.error("Error accessing media devices.", error);
        });
    } else {
      try {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        }
      } catch (error) {
        console.error("Error stopping media tracks.", error);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        if (connections[fromId]) {
          const state = connections[fromId].signalingState;

          if (signal.sdp.type === "offer") {
            connections[fromId]
              .setRemoteDescription(new RTCSessionDescription(signal.sdp))
              .then(() => {
                connections[fromId]
                  .createAnswer()
                  .then((description) => {
                    connections[fromId]
                      .setLocalDescription(description)
                      .then(() => {
                        socketRef.current.emit(
                          "signal",
                          fromId,
                          JSON.stringify({
                            sdp: connections[fromId].localDescription,
                          })
                        );
                      })
                      .catch((error) => {
                        console.error(
                          "Error setting local description.",
                          error
                        );
                      });
                  })
                  .catch((error) => {
                    console.error("Error creating answer.", error);
                  });
              })
              .catch((error) => {
                console.error("Error setting remote description.", error);
              });
          } else if (signal.sdp.type === "answer") {
            if (state === "have-local-offer") {
              connections[fromId]
                .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .catch((error) => {
                  console.error("Error setting remote answer.", error);
                });
            }
          }
        }
      }

      if (signal.ice) {
        if (connections[fromId]) {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((error) => {
              console.error("Error adding ICE candidate.", error);
            });
        }
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data, socketId: socketIdSender },
    ]);

    if (socketIdSender !== socketIdRef.current && !isChatOpen) {
      setNewMessages((prev) => prev + 1);
    }

    setTimeout(() => {
      const messagesContainer = document.querySelector(".messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(serverUrl, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        console.log("User left:", id);

        setVideos((videos) => {
          videos.forEach((v) => {
            if (v.socketId === id && v.streamId) {
              addedStreams.delete(v.streamId);
            }
          });
          return videos.filter((video) => video.socketId !== id);
        });

        if (connections[id]) {
          try {
            connections[id].close();
            delete connections[id];
          } catch (e) {
            console.error("Error closing connection:", e);
          }
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (connections[socketListId]) {
            console.log("Connection already exists for:", socketListId);
            return;
          }

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].ontrack = (event) => {
            console.log("ontrack fired:", {
              socketId: socketListId,
              trackKind: event.track.kind,
              streamId: event.streams[0]?.id,
            });

            const streamId = event.streams[0]?.id;

            if (addedStreams.has(streamId)) {
              console.log("Stream already added, skipping:", streamId);
              return;
            }

            addedStreams.add(streamId);
            console.log("Added stream to tracking set:", streamId);

            let videosExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videosExists) {
              console.log("Updating existing video for:", socketListId);

              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.streams[0], streamId }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              console.log("Creating NEW video for:", socketListId);

              let newVideo = {
                socketId: socketListId,
                stream: event.streams[0],
                streamId: streamId,
                autoPlay: true,
                playsInline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id !== socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) {
              continue;
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((error) => {
                  console.error("Error creating offer.", error);
                });
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    if (username.trim() === "") {
      alert("Please enter your name");
      return;
    }
    setAskForUsername(false);
    getMedia();
  };

  let handleVideoToggle = () => {
    setVideo(!video);
  };

  let handleAudioToggle = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    } catch (error) {
      console.error("Error stopping previous stream.", error);
    }

    window.localStream = stream;
    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }

      const senders = connections[id].getSenders();
      senders.forEach((sender) => {
        connections[id].removeTrack(sender);
      });

      stream.getTracks().forEach((track) => {
        connections[id].addTrack(track, stream);
      });

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((error) => {
            console.error("Error creating offer.", error);
          });
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreenSharing(false);

        try {
          if (localVideoRef.current && localVideoRef.current.srcObject) {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          }
        } catch (error) {
          console.error("Error stopping media tracks.", error);
        }

        getUserMedia();
      };
    });
  };

  let handleScreenShareToggle = () => {
    if (!screenSharing) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then((stream) => {
            getDisplayMediaSuccess(stream);
            setScreenSharing(true);
          })
          .catch((error) => {
            console.error("Error accessing display media.", error);
            setScreenSharing(false);
          });
      }
    } else {
      setScreenSharing(false);

      try {
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      } catch (error) {
        console.error("Error stopping screen share tracks.", error);
      }

      getUserMedia();
    }
  };

  let sendMessage = () => {
    if (message.trim() === "") return;

    socketRef.current.emit("chat-message", message, username);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: username || "You",
        data: message,
        socketId: socketIdRef.current,
        isLocal: true,
      },
    ]);

    setMessage("");

    setTimeout(() => {
      const messagesContainer = document.querySelector(".messages-container");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  let handleEndCall = () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(connections).forEach((conn) => conn.close());
      connections = {};
      addedStreams.clear();
    } catch (error) {
      console.error("Error during cleanup.", error);
    } finally {
      window.location.href = "/";
    }
  };

  const getGridColumns = () => {
    const totalVideos = videos.length + 1;

    if (spotlightVideo) {
      return "grid-cols-1";
    }

    if (totalVideos === 1) {
      return "grid-cols-1";
    } else if (totalVideos === 2) {
      return "grid-cols-1 md:grid-cols-2";
    } else if (totalVideos <= 4) {
      return "grid-cols-2 md:grid-cols-2";
    } else if (totalVideos <= 6) {
      return "grid-cols-2 md:grid-cols-3";
    } else if (totalVideos <= 9) {
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-3";
    } else if (totalVideos <= 12) {
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    } else {
      return "grid-cols-2 md:grid-cols-4 lg:grid-cols-5";
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center px-2 sm:px-4 lg:px-6">
      {askForUsername ? (
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-6 sm:p-10 w-full max-w-md shadow-2xl border border-gray-700 text-center animate-fade-in">
          <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-6">
            Join the Meeting
          </h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4 transition"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyPress={(e) => e.key === "Enter" && connect()}
            autoFocus
          />

          <button
            onClick={connect}
            disabled={!username.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 mb-4 rounded-lg transition cursor-pointer"
          >
            Join Meeting
          </button>

          {created && (
            <div className="w-full bg-[#111418] border border-gray-700/80 p-4 rounded-xl mb-4 shadow-md">
              <p className="text-gray-400 text-sm font-medium mb-2">
                Your Meeting Code
              </p>

              <div className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-3">
                <span className="text-orange-400 font-mono text-xl sm:text-2xl tracking-wide">
                  {meetingCode}
                </span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(meetingCode);
                    toast.success("Meeting code copied!");
                  }}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-semibold px-4 py-2 rounded-md text-sm transition cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2
             2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="rounded-lg border-2 border-gray-700 w-48 sm:w-64 h-32 sm:h-40 object-cover shadow-lg"
            />
          </div>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-2 sm:gap-3 md:gap-4 justify-center items-center w-full max-w-7xl p-2 sm:p-4 transition-all duration-300 ${getGridColumns()}`}
          >
            {spotlightVideo ? (
              <div className="relative w-full animate-fade-in">
                <video
                  ref={(ref) => {
                    if (ref && spotlightVideo?.stream) {
                      ref.srcObject = spotlightVideo.stream;
                    }
                  }}
                  autoPlay
                  muted={spotlightVideo.isLocal}
                  className="rounded-xl w-full h-[50vh] sm:h-[60vh] md:h-[70vh] object-cover border-4 border-orange-500 cursor-pointer transition shadow-2xl"
                  onClick={() => setSpotlightVideo(null)}
                />
                <p className="absolute bottom-2 left-2 bg-black/70 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {spotlightVideo.isLocal
                    ? "You (Click to exit)"
                    : `User ${spotlightVideo.socketId?.slice(
                        0,
                        4
                      )} (Click to exit)`}
                </p>
              </div>
            ) : (
              <>
                {videos.map((video, index) => (
                  <div
                    className="relative w-full group"
                    key={`${video.socketId}-${index}`}
                  >
                    <video
                      data-socket={video.socketId}
                      ref={(ref) => {
                        if (ref && video.stream) {
                          ref.srcObject = video.stream;
                        }
                      }}
                      autoPlay
                      playsInline
                      className="rounded-lg border border-gray-700 w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover cursor-pointer hover:scale-105 hover:border-orange-500 transition-all shadow-lg"
                      onClick={() =>
                        setSpotlightVideo({
                          stream: video.stream,
                          isLocal: false,
                          socketId: video.socketId,
                        })
                      }
                    />
                    <p className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {video.socketId?.slice(0, 4) || "User"}
                    </p>
                  </div>
                ))}

                <div className="relative w-full group">
                  <video
                    ref={(ref) => {
                      if (ref && window.localStream) {
                        ref.srcObject = window.localStream;
                      }
                      localVideoRef.current = ref;
                    }}
                    autoPlay
                    muted
                    className={`rounded-lg border-2 w-full h-32 sm:h-40 md:h-48 lg:h-56 object-cover cursor-pointer hover:scale-105 transition-all shadow-lg ${
                      screenSharing ? "border-blue-500" : "border-green-500"
                    }`}
                    onClick={() =>
                      setSpotlightVideo({
                        stream: window.localStream || localStream,
                        isLocal: true,
                      })
                    }
                  />
                  <p
                    className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded backdrop-blur-sm ${
                      screenSharing ? "bg-blue-600/80" : "bg-green-600/80"
                    }`}
                  >
                    {screenSharing ? "You (Sharing)" : username || "You"}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 md:gap-4 bg-black/70 backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full border border-gray-700 shadow-2xl z-50">
            <button
              onClick={handleAudioToggle}
              className={`text-xl sm:text-2xl md:text-3xl p-2 sm:p-3 rounded-full transition cursor-pointer ${
                audio
                  ? "text-white hover:bg-gray-800"
                  : "text-red-500 bg-red-500/20 hover:bg-red-500/30"
              }`}
              title={audio ? "Mute" : "Unmute"}
            >
              {audio ? (
                <i className="ri-mic-fill"></i>
              ) : (
                <i className="ri-mic-off-fill"></i>
              )}
            </button>

            <button
              onClick={handleVideoToggle}
              className={`text-xl sm:text-2xl md:text-3xl p-2 sm:p-3 rounded-full transition cursor-pointer ${
                video
                  ? "text-white hover:bg-gray-800"
                  : "text-red-500 bg-red-500/20 hover:bg-red-500/30"
              }`}
              title={video ? "Stop Video" : "Start Video"}
            >
              {video ? (
                <i className="ri-video-on-fill"></i>
              ) : (
                <i className="ri-video-off-fill"></i>
              )}
            </button>

            {screenSharingAvailable && (
              <button
                onClick={handleScreenShareToggle}
                className={`text-xl sm:text-2xl md:text-3xl p-2 sm:p-3 rounded-full transition cursor-pointer ${
                  screenSharing
                    ? "text-blue-400 bg-blue-500/20 hover:bg-blue-500/30"
                    : "text-white hover:bg-gray-800"
                }`}
                title={screenSharing ? "Stop Sharing" : "Share Screen"}
              >
                {screenSharing ? (
                  <i className="ri-stop-circle-fill"></i>
                ) : (
                  <i className="ri-macbook-fill"></i>
                )}
              </button>
            )}

            <button
              className="relative text-white text-xl sm:text-2xl md:text-3xl p-2 sm:p-3 rounded-full hover:bg-gray-800 transition cursor-pointer"
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) setNewMessages(0);
              }}
              title="Messages"
            >
              <i className="ri-message-2-fill"></i>
              {newMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 rounded-full min-w-[18px] sm:min-w-[20px] text-center animate-bounce">
                  {newMessages > 9 ? "9+" : newMessages}
                </span>
              )}
            </button>

            <button
              onClick={handleEndCall}
              className="text-white text-xl sm:text-2xl md:text-3xl p-2 sm:p-3 rounded-full bg-red-600 hover:bg-red-700 transition shadow-lg cursor-pointer"
              title="Leave Meeting"
            >
              <i className="ri-phone-fill rotate-[135deg]"></i>
            </button>
          </div>
        </>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-black/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700 bg-black/60">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <i className="ri-chat-3-fill text-orange-500"></i>
            Chat Room
          </h2>
          <button
            onClick={() => setIsChatOpen(false)}
            className="text-white text-2xl hover:text-red-400 transition p-1 cursor-pointer"
          >
            <i className="ri-close-fill"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 messages-container">
          {messages.length === 0 ? (
            <div className="text-center mt-10">
              <i className="ri-chat-off-line text-6xl text-gray-600"></i>
              <p className="text-gray-400 text-sm mt-4">No messages yet…</p>
            </div>
          ) : (
            messages.map((item, index) => (
              <div
                key={`${item.socketId}-${index}`}
                className={`flex ${
                  item.isLocal ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                <div
                  className={`p-3 max-w-[85%] rounded-lg text-sm shadow-lg ${
                    item.isLocal
                      ? "bg-orange-500 text-black rounded-br-none"
                      : "bg-gray-800 text-white rounded-bl-none"
                  }`}
                >
                  <p className="font-semibold mb-1 text-xs opacity-80">
                    {item.sender}
                  </p>
                  <p className="break-words">{item.data}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-700 bg-black/80 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-gray-900 text-white p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-4 py-3 rounded-lg text-sm font-semibold transition shadow-lg cursor-pointer"
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoMeetPage;
