import React, { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import "./App.css";

// Connect to your specific Render URL
const socket = io.connect("https://chatappserver-3b1w.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>WhatsApp Clone</h3>
          <p style={{ color: connected ? "green" : "red" }}>
            Server Status: {connected ? "Online" : "Waking up (Please wait...)"}
          </p>
          <input type="text" placeholder="Your Name..." onChange={(e) => setUsername(e.target.value)} />
          <input type="text" placeholder="Room ID..." onChange={(e) => setRoom(e.target.value)} />
          <button onClick={joinRoom} disabled={!connected}>Join Room</button>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-header"><p>Live Chat - Room: {room}</p></div>
          <div className="chat-body">
            <ScrollToBottom className="message-container">
              {messageList.map((msg, index) => (
                <div className="message" key={index} id={username === msg.author ? "you" : "other"}>
                  <div>
                    <div className="message-content"><p>{msg.message}</p></div>
                    <div className="message-meta"><p>{msg.time} - {msg.author}</p></div>
                  </div>
                </div>
              ))}
            </ScrollToBottom>
          </div>
          <div className="chat-footer">
            <input 
              type="text" 
              value={currentMessage}
              placeholder="Message..." 
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>&#9658;</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;