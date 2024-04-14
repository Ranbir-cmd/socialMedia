import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    // useColorModeValue,
    Link,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useSetRecoilState } from 'recoil'
import authScreenAtom from '../atoms/authAtom'
import useShowToast from '../hooks/useShowToast'
import userAtom from '../atoms/userAtom'

export default function LoginCard() {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const setAuthScreen = useSetRecoilState(authScreenAtom);
    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast()
    const [inputVal, setInputVal] = useState({
        username: "",
        password: ""
    })

    const handleLogin = async () => {
        setLoading(true)
       try {
         const res = await fetch("/api/users/login", {
             method: "POST",
             headers: {
               "content-type": "application/json",  
             },
             body: JSON.stringify(inputVal)
         });
         const data = await res.json();
           if (data.error) {
               showToast("Error", data.error, "error");
               return;
           }
           localStorage.setItem("userInfo", JSON.stringify(data));
           setUser(data);
       } catch (error) {
        showToast("Error", error, "error")
       } finally {
        setLoading(false);
       }
    };

    return (
        <Flex
            // minH={'100vh'}
            align={'center'}
            justify={'center'}
        // bg={useColorModeValue('gray.50', 'gray.800')}
            
        >
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={0}>
                <Stack align={'center'}>
                    <Heading 
                        fontSize={{
                            base: "24px",
                            sm: "32px",
                            md: "4xl",
                        }}
                     textAlign={'center'}>
                        Login 
                    </Heading>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={"gray.dark"}
                    boxShadow={'lg'}
                    p={8}
                    w={{ base: "full", sm: "400px" }}
                >
                    <Stack spacing={4}>

                        <FormControl isRequired>
                            <FormLabel>User name</FormLabel>
                            <Input
                                type="text"
                                value={inputVal.username}
                                onChange={(e) => setInputVal({ ...inputVal, username: e.target.value })}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={inputVal.password}
                                    onChange={(e) => setInputVal({ ...inputVal, password: e.target.value })}
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Logging in..."
                                size="lg"
                                bg={"gray.light"}
                                color={'white'}
                                _hover={{
                                    bg: "gray.light",
                                }}
                                onClick={handleLogin}
                                isLoading={loading}
                                fontSize={{
                                    base: "14px",
                                    sm: "16px",
                                    md: "18px",
                                }}
                            >
                                Login
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text 
                            align={'center'}
                                fontSize={{
                                    base: "12px",
                                    md: "14px",
                                }}
                            >
                                Don&apos;t have an account? <Link color={'blue.400'} onClick={() => setAuthScreen("signup")}>Signup</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    )
}