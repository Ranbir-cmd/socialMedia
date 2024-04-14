
import { Avatar, Box, Flex, Menu, MenuButton, MenuItem, MenuList, Portal, Text, VStack, Link, useToast, Button, useColorModeValue } from "@chakra-ui/react"
import { Link as routerLink } from "react-router-dom"
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ user }) => {
    // const toast = useToast();
    const currentUser = useRecoilValue(userAtom);
    const { handleFollowUnfollow, updating, following } = useFollowUnfollow(user);


    // const copyURL = () => {
    //     const currentURL = window.location.href;
    //     navigator.clipboard.writeText(currentURL).then(() => {
    //         toast({
    //             title: "Success.",
    //             status: "success",
    //             description: "Profile link copied.",
    //             duration: 3000,
    //             isClosable: true,
    //             // colorScheme: "blue",
    //         });
    //     });
    // };



    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex w={"full"} justifyContent={"space-between"} alignItems={"start"}>
                <Flex gap={4} w={"full"}>
                    <Box>
                        {user.profilePic && (
                            <Avatar
                                name={user.name}
                                src={user.profilePic}
                                size={{
                                    base: "md",
                                    md: "xl",
                                }}
                            />
                        )}
                        {!user.profilePic && (
                            <Avatar
                                name={user.name}
                                src='https://bit.ly/broken-link'
                                size={{
                                    base: "md",
                                    md: "xl",
                                }}
                            />
                        )}
                    </Box>
                    <Box>
                        <Text fontSize={"2xl"} fontWeight={"bold"}>
                            {user.name}
                        </Text>
                        <Flex gap={2} alignItems={"center"}>
                            <Text fontSize={"sm"}>{user.username}</Text>
                        </Flex>
                        <Text
                            color={"gray.400"}
                            fontSize={"14px"}
                            fontWeight={"medium"}
                        >{user.bio}</Text>
                    </Box>
                </Flex>
                <Flex>
                    <Text
                        w={"5rem"}
                        textAlign={"end"}
                        color={"gray.400"}
                        fontWeight={"medium"}
                    >
                        {user.followers.length} followers
                    </Text>
                </Flex>
            </Flex>
            {currentUser?._id === user._id &&
                <Link as={routerLink} to="/update">
                    <Button
                        size={"sm"}
                        border={"1px solid #333"}
                    >
                        Edit Profile
                    </Button>
                </Link>
            }
            {currentUser?._id !== user._id &&
                <Button
                    size={"sm"}
                    onClick={handleFollowUnfollow}
                    isLoading={updating}
                >{following ? "Unfollow" : "Follow"}
                </Button>
            }
            <Flex w={"full"} justifyContent={"space-between"} marginBottom={4}>
                <Flex gap={2} alignItems={"center"}>

                    {/* <Box w='1' h='1' bg={"gray.light"} borderRadius={"full"}></Box> */}
                    {/* <Link color={"gray.light"}>instagram.com</Link> */}
                </Flex>
                {/* <Flex>
                    <Box className='icon-container'>
                        <BsInstagram size={24} cursor={"pointer"} />
                    </Box>
                    <Box className='icon-container'>
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg={"gray.dark"}>
                                    <MenuItem
                                        bg={"gray.dark"}
                                        onClick={copyURL}
                                    >
                                        Copy link
                                    </MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </Flex> */}
            </Flex>

            {/* <Flex w={"full"}>
                <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb='3' cursor={"pointer"}>
                    <Text fontWeight={"bold"}> Threads</Text>
                </Flex>
                <Flex
                    flex={1}
                    borderBottom={"1px solid gray"}
                    justifyContent={"center"}
                    color={"gray.light"}
                    pb='3'
                    cursor={"pointer"}
                >
                    <Text fontWeight={"bold"}> Replies</Text>
                </Flex>
            </Flex> */}
        </VStack>
    )
}

export default UserHeader
