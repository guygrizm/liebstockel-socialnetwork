import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";

let socket;

const connect = () => {
    if (!socket) {
        socket = io.connect();
    }
    return socket;
};

const disconnect = () => {
    socket.disconnect();
    socket = null;
};
export default function Chat() {
    const [chatMessage, setMessage] = useState([]);
    const listRef = useRef(null);

    useEffect(() => {
        console.log("so far so good");
        socket = connect();

        socket.on("chat", function getMessage(data) {
            setMessage(data);
        });

        socket.on("newMessage", (newMessage) => {
            setMessage((chatMessage) => [...chatMessage, newMessage]);
        });

        return () => {
            console.log("cleanup");
            disconnect();
        };
    }, []);
    useEffect(() => {
        console.log("last messages");
        const lastChatMessage = listRef.current.lastChild;
        if (lastChatMessage) {
            lastChatMessage.scrollIntoView({ behavior: "smooth" });
        }

        console.log("listRef: ", listRef.current.lastChild);
    }, [chatMessage]);

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            console.log("event.target.value: ", event.target.value);

            const newMessage = event.target.value;
            console.log("newMessage: ", newMessage);

            socket.emit("newMessage", { message: newMessage });

            event.target.value = "";
        }
    }

    return (
        <div className="chat-page">
            <h1>Chat Room</h1>
            <ul className="chats-container" ref={listRef}>
                {chatMessage.map((message) => (
                    <li key={message.id}>
                        <p className="chatSender">
                            {message.first_name} {message.last_name}
                        </p>
                        <div className="chatblock">
                            <img
                                src={message.profile_picture_url}
                                className="chatPic"
                            />
                            <p className="chatMsg">{message.message}</p>
                        </div>
                    </li>
                ))}
            </ul>
            <textarea onKeyDown={handleKeyDown}></textarea>
        </div>
    );
}
