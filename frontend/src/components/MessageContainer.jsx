import { Avatar, Divider, Flex, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react"
import Message from "./Message"
import MessageInput from "./MessageInput"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { conversationsAtom, selectedConversationAtom } from "../atoms/conversationsAtom"
import useShowToast from "../hooks/useShowToast"
import userAtom from "../atoms/userAtom"
import { useSocket } from "../context/SocketContext"
import notificationSound from "../assets/sounds/message-notification.mp3";

const MessageContainer = () => {
    const [loadingMessages, setLoadingMessages] = useState(true);
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const [messages, setMessages] = useState([]);
    const showToast = useShowToast();
    const messageEndRef = useRef(null);
    const currentUser = useRecoilValue(userAtom);
    const {socket} = useSocket();
    const setConversations = useSetRecoilState(conversationsAtom);

    // listen for new messages coming through socket 
    useEffect(() => {
        socket.on("newMessage", (message) => {
            if(selectedConversation._id === message.conversationId){
                setMessages((prevMsg) => [...prevMsg, message]);
            }
            if(!document.hasFocus){
                const sound = new Audio(notificationSound);
                sound.play();
            }

            // updating last message  of recipient 
            setConversations((prev) => {
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender,
                            },
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        })

        return () => socket.off("newMessage");  // will not listen the event if user unmount
    }, [socket, selectedConversation, setConversations]);

    // seen message 
    useEffect(() => {
        // if message from others, sending event with that conversationId and userid 
        const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id;
        if (lastMessageIsFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId,
            });
        }

        // and on event coming from server, updating message 
        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation._id === conversationId) {
                setMessages((prev) => {
                    const updatedMessages = prev.map((message) => {
                        if (!message.seen) {
                            return {
                                ...message,
                                seen: true,
                            };
                        }
                        return message;
                    });
                    return updatedMessages;
                });
            }
        });
    }, [socket, currentUser._id, messages, selectedConversation]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true);
            setMessages([]);
            try {
                if (selectedConversation.mock) return;
                const res = await fetch(`/api/messages/${selectedConversation.userId}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setMessages(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingMessages(false);
            }
        };

        getMessages();
    }, [showToast, selectedConversation.userId, selectedConversation.mock]);

    return (
        <Flex
            flex='70'
            bg={"gray.dark"}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
        >
            <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                <Avatar
                    src={selectedConversation.userProfilePic}
                    size={"sm"} />
                <Text display={"flex"} alignItems={"center"}>
                    {selectedConversation.username} 
                </Text>
            </Flex>
            <Divider />
            <Flex flexDir={"column"} gap={4} my={4} p={2} height={"400px"} overflowY={"auto"}>
                {loadingMessages &&
                    [...Array(5)].map((_, i) => (
                        <Flex
                            key={i}
                            gap={2}
                            alignItems={"center"}
                            p={1}
                            borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={7} />}
                            <Flex flexDir={"column"} gap={2}>
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                            </Flex>
                            {i % 2 !== 0 && <SkeletonCircle size={7} />}
                        </Flex>
                    ))}

                {
                    !loadingMessages && (
                        messages.map((message) => (
                            <Flex
                                key={message._id}
                                direction={"column"}
                                ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}
                            >
                                <Message
                                    message={message} 
                                    ownMessage={currentUser._id === message.sender}
                                />
                            </Flex>
                        ))
                    )}
            </Flex>

            <MessageInput setMessages={setMessages} />

        </Flex>
    )
}

export default MessageContainer