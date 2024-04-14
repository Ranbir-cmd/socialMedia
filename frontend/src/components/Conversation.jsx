import { Avatar, AvatarBadge, Box, Flex, Stack, Text, WrapItem } from "@chakra-ui/react"
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/conversationsAtom";

const Conversation = ({ conversation, isOnline }) => {
    const user = conversation.participants[0];
    const lastMsg = conversation.lastMessage;

    const currentUser = useRecoilValue(userAtom);
    const [selectedConversation, setSelectedConverstaion] = useRecoilState(selectedConversationAtom)
    
    // const colorMode = useColorMode()

    return (
        <Flex
            gap={4}
            alignItems={"center"}
            p={"1"}
            _hover={{
                cursor: "pointer",
                bg: "gray.dark",
                color: "white",
            }}
            borderRadius={"md"}
            onClick={() => setSelectedConverstaion({
                _id: conversation?._id,
                userId: user?._id,
                userProfilePic: user?.profilePic,
                username: user?.username,
                mock: conversation.mock
            })}
            bg={
                selectedConversation?._id === conversation._id ? "gray.dark" : ""
                
                    // colorMode === "light" ? "gray.600" : "gray.dark"
                        
                
                   
            }
        >
            <WrapItem>
                <Avatar
                    size={{
                        base: "xs",
                        sm: "sm",
                        md: "md",
                    }}
                    src={user?.profilePic ?? "https://bit.ly/broken-link" }>
                    { isOnline ? <AvatarBadge boxSize={"1em"} bg={"green.500"} /> : ""}
                </Avatar>
            </WrapItem>
            <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight={"700"} display={"flex"} alignItems={"center"}>{user?.username} </Text>
                <Text
                    fontSize={"xs"}
                    display={"flex"}
                    alignItems={"center"}
                    gap={"1"}>
                    {currentUser._id === lastMsg.sender ? (
                        <Box color={lastMsg.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : (
                        ""
                    )}
                    {lastMsg.text.length > 18 ? lastMsg.text.substring(0, 18) + "..." : lastMsg.text || <BsFillImageFill size={12} />}
                </Text>
            </Stack>
        </Flex>
    )
}

export default Conversation