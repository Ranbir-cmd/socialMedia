import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext();
// a hook to use the context 
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const user = useRecoilValue(userAtom);

    useEffect(() => {
        // if user is authenticated, make a connection with backend
        const socket = io("/", {
            query: {
                userId: user?._id,
            },
        });

        setSocket(socket);

        socket.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);
        }); // listening online users event which is emitted from server

         // will close socket if component unmount 
        return () => socket && socket.close();
    }, [user?._id]);

    return <SocketContext.Provider value={{ socket, onlineUsers }}>         {children}
    </SocketContext.Provider>;
};
