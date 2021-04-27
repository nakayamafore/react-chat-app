import { useState, useEffect } from "react"

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatApiUrlBase = `${API_ENDPOINT}/api/chat?roomId=`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useLoadChat = () => {
    const [messages, setMessages] = useState([{ content: "welcome room!" }, { content: "please select room" }]);
    const [roomId, setRoomId] = useState(0);

    useEffect(() => {
        console.log("loadChats")
        if (!roomId || roomId === 0) {
            console.log("cancel loadChats")
            return
        }
        setMessages([{ content: `welcome room${roomId}!` }]);
        const token = loadJson(`token`)
        const method = "GET";
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-jwt-token': token
        };
        console.log("token取得")
        const chatApiUrl = `${chatApiUrlBase}${roomId}`
        console.log(chatApiUrl)
        fetch(chatApiUrl, { method, headers })
            .then(res => res.json())
            .then(e => {
                console.log('Chats Recieved: ')
                setMessages(prevMessages => [...prevMessages, ...e]);
            })
            .catch()
    }, [roomId])

    return { roomId, setRoomId, messages, setMessages }
}
export default useLoadChat