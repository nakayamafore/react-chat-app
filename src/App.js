import './App.css';
import React, { useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Login from "./Components/Login"
import Chat from "./Components/Chat"

const loadJSON = key => key && JSON.parse(localStorage.getItem(key))
const AuthRoute = ({ ...props }) => {
  let navigate = useNavigate()
  const isAuthenticated = loadJSON(`isAuthenticated`)
  const token = loadJSON(`token`)

  useEffect(() => {
    if (props.path !== "/login" && (!isAuthenticated || !token)) {
      navigate(`/login`)
    }
  }, [isAuthenticated, token, navigate, props.path])

  if (isAuthenticated) {
    return <Route {...props} />
  } else {
    console.log(`ログインしていないユーザーは${props.path}へはアクセスできません`)
    return <></>
  }
}
export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <AuthRoute path="/chat" element={<Chat />} />
      </Routes>

    </div>
  );
}
