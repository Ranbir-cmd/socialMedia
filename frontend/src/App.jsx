
import { Box, Container } from '@chakra-ui/react'
import './App.css'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import { useRecoilValue } from 'recoil'
import userAtom from './atoms/userAtom'
import UpdateProfilePage from './pages/UpdateProfilePage'
import CreatePost from './components/CreatePost'
import ChatPage from './pages/ChatPage'

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();

  return (
    <Box position={"relative"} w='full'>
      <Container
        // maxW={"850px"}
        paddingLeft={"20"}
        paddingRight={"20"}
        maxW={pathname === "/" ? { base: "850px", md: "1024px" } : "850px"}

      >
        <Header />
        <Routes>
          <Route path='/' element={
            user ?
              <>
                <HomePage />
                <CreatePost />
              </>
              :
              <Navigate to={"/auth"} />
          } />
          <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to={"/"} />} />
          <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to={"/auth"} />} />
          <Route
            path='/:username'
            element={
              user ? (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              ) : (
                <UserPage />
              )
            }
          />
          <Route path='/:username/post/:pid' element={<PostPage />}>
          </Route>
          <Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />}>
          </Route>
        </Routes>
        {/* {user && <CreatePost />} */}
      </Container>
    </Box>
  )
}

export default App
