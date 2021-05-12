import { useState, useEffect } from "react"
import useChatIndexDb from '../Hooks/useChatIndexDb'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatApiUrlBase = `${API_ENDPOINT}/api/chat`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useLoadChat = () => {
    const [messages, setMessages] = useState([{ content: "welcome room!" }, { content: "please select room" }])
    const [roomId, setRoomId] = useState(0)
    const { chatIndexDb } = useChatIndexDb()

    useEffect(() => {
        console.log("loadChats")
        const findLast = async e => {
            console.log("lastChat")
            if (!roomId || roomId === 0) {
                console.log("cancel loadChats")
                return
            }
            const lastChatId = await chatIndexDb.findLastChat()
            if (lastChatId) {
                console.log("==== lastChat: " + lastChatId)
            }

            setMessages([{ content: `welcome room${roomId}!` }]);
            await chatIndexDb.findByRoomId(roomId, setMessages)

            const token = loadJson(`token`)
            const method = "GET";
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-jwt-token': token
            }

            const chatApiUrl = `${chatApiUrlBase}?roomId=${roomId}&lastChatId=${lastChatId}`
            await fetch(chatApiUrl, { method, headers })
                .then(res => res.json())
                .then(e => {
                    console.log('Chats Recieved: ')
                    setMessages(prevMessages => [...prevMessages, ...e])
                    e.forEach(chat => {
                        chatIndexDb.put(chat)
                    });
                    scrollBottom()
                })
                .catch()
        }
        findLast()
    }, [roomId])

    const scrollBottom = () => {
        var element = document.documentElement;
        var bottom = element.scrollHeight - element.clientHeight;
        window.scroll(0, bottom)
    }

    return { roomId, setRoomId, messages, setMessages }
}
export default useLoadChat