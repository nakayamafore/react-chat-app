import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const saveJSON = (key, data) => localStorage.setItem(key, JSON.stringify(data))

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const loginUrl = `${API_ENDPOINT}/api/login`
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [jwt, setJwt] = useState();
    let navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleButtonClick = (e) => {
        console.log("handleButtonClick")
        const obj = { email, password };
        const method = "POST";
        const body = JSON.stringify(obj);
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        console.log("token取得")
        fetch(loginUrl, { method, headers, body })
            .then(res => res.json())
            .then(setJwt)
            .catch()
    }

    useEffect(() => {
        if (!jwt) return
        console.log("saveLocalstrage")
        saveJSON(`token`, jwt.token)
        saveJSON(`user`, email)
        saveJSON(`userId`, jwt.userId)
        saveJSON(`isAuthenticated`, true)
        setIsAuthenticated(true)
        console.log("saveLocalstrage終了")
    }, [jwt, email])

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/chat")
        }
    }, [isAuthenticated, navigate])

    return (
        <div>
            <div>login</div>
            <input type="text" value={email} onChange={(e) => { setEmail(e.target.value) }} />
            <div>password</div>
            <input type="text" value={password} onChange={(e) => { setPassword(e.target.value) }} />
            <button type="submit" onClick={handleButtonClick}>ログイン</button>
        </div>
    )
}