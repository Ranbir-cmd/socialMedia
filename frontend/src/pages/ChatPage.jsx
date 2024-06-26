import { SearchIcon } from "@chakra-ui/icons"
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react"
import Conversation from "../components/Conversation"
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/conversationsAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
    const showToast = useShowToast();
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const [selectedConversation, setSelectedConverstaion] = useRecoilState(selectedConversationAtom);
    const [searchText, setSearchText] = useState("");
    const [searchingUser, setSearchingUser] = useState(false);
    const currentUser = useRecoilValue(userAtom);
    const { socket, onlineUsers } = useSocket();

    useEffect(() => {
        socket?.on("messagesSeen", ({ conversationId }) => {
            setConversations((prev) => {
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                seen: true,
                            },
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        });
    }, [socket, setConversations]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await fetch("/api/messages/conversations");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                // console.log(data);
                setConversations(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingConversations(false);
            }
        };

        getConversations();
    }, [showToast, setConversations]);

    const handleConversation = async (e) => {
        e.preventDefault();
        if (!searchText) {
            showToast("Error", "Please type a username", "error");
            return;
        }
        setSearchingUser(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);
            const searchedUser = await res.json();
            if (searchedUser.error) {
                showToast("Error", searchedUser.error, "error");
                return;
            }

            if (searchedUser._id === currentUser._id) {
                showToast("Error", "You cant message yourself", "error");
            }

            // if searched user has already conversations, then open chat directly 
            const conversationAlreadyExists = conversations.find(
                (conversation) => conversation.participants[0]?._id === searchedUser?._id
            );
            if (conversationAlreadyExists) {
                setSelectedConverstaion({
                    _id: conversationAlreadyExists._id,
                    userId: searchedUser._id,
                    username: searchedUser.username,
                    userProfilePic: searchedUser.profilePic,
                });
                return;
            }

            // if no existed conversation with searched userAtom, then create a conversation 
            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "",
                    sender: "",
                },
                _id: Date.now(),
                participants: [
                    {
                        _id: searchedUser._id,
                        username: searchedUser.username,
                        profilePic: searchedUser.profilePic,
                    },
                ],
            };
            setConversations((prevConvs) => [mockConversation, ...prevConvs]);
            setSearchText("");
        } catch (error) {
            showToast("Error", error.message, "error");

        } finally {
            setSearchingUser(false);
        }
    }

    return (
        <Box position={"absolute"}
            left={"50%"}
            w={{ base: "100%", md: "80%", lg: "950px" }}
            p={4}
            transform={"translateX(-50%)"}>
            <Flex
                gap={4}
                flexDirection={{ base: "column", md: "row" }}
                maxW={{
                    sm: "400px",
                    md: "full",
                }}
                mx={"auto"}
            >
                <Flex
                    flex={
                        {
                            sm: 50,
                            md: 30
                        }
                    }
                    gap={2}
                    flexDirection={"column"}
                    w={{
                        sm: "450px",
                        md: "full",
                    }}
                    mx={"auto"}
                >
                    <Text fontWeight={700} color={"gray.400"}>Your conversations</Text>
                    <form onSubmit={handleConversation}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Button
                                size={"sm"}
                                onClick={handleConversation}
                                isLoading={searchingUser}
                            >
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>

                    {loadingConversations &&
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={"center"} p={"1"} borderRadius={"md"}>
                                <Box>
                                    <SkeletonCircle size={"10"} />
                                </Box>
                                <Flex w={"full"} flexDirection={"column"} gap={3}>
                                    <Skeleton h={"10px"} w={"80px"} />
                                    <Skeleton h={"8px"} w={"90%"} />
                                </Flex>
                            </Flex>
                        ))}

                    {!loadingConversations && conversations?.length === 0 && 
                        <Text fontWeight={500} color={"gray.400"}>You do not have any conversation yet. Search user to start a conversation.</Text>
                    }

                    {!loadingConversations && (
                        conversations?.map(conversation => (
                            <Conversation
                                key={conversation._id}
                                conversation={conversation}
                                isOnline={onlineUsers.includes(conversation?.participants[0]?._id)}
                            />
                        ))
                    )
                    }
                </Flex>

                {!selectedConversation._id && (
                    <Flex
                        flex={{
                            sm: 50,
                            md: 70
                        }}
                        borderRadius={"md"}
                        p={2}
                        flexDir={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <GiConversation size={100} />
                        <Text fontSize={20}>Select a conversation to start messaging</Text>
                    </Flex>
                )}

                {selectedConversation._id && <MessageContainer />}
            </Flex>
        </Box>
    )
}

export default ChatPage