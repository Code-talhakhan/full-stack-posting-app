import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children, currentUser }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (currentUser?._id) {
            // Express backend ka URL (port 3001)
            const newSocket = io("http://localhost:3001", {
                withCredentials: true
            });

            setSocket(newSocket);

            // Backend par user register karein
            newSocket.emit("registerUser", currentUser._id);

            return () => newSocket.close();
        }
    }, [currentUser]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);