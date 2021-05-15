import { useState, useEffect } from "react"
import useChatIndexDb from '../Hooks/useChatIndexDb'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatApiUrlBase = `${API_ENDPOINT}/api/chat`
const chatLastViewedDateApiUrlBase = `${API_ENDPOINT}/api/roomUsers/lastViewedDate`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useLoadChat = () => {
    const [userId] = useState(loadJson(`userId`));
    const [messages, setMessages] = useState([{ content: "welcome room!" }, { content: "please select room" }])
    const [roomId, setRoomId] = useState(0)
    const [lastViewedDate, setLastViewedDate] = useState(0)
    const { chatIndexDb } = useChatIndexDb()

    useEffect(() => {
        console.log("loadChats")
        console.log("lastChat")
        if (!roomId || roomId === 0) {
            console.log("cancel loadChats")
            return
        }
        // APIから取得
        const loadChatData = async e => {
            // const lastChatId = await chatIndexDb.findLastChat()
            const lastChatId = 0
            if (lastChatId) {
                console.log("==== lastChat: " + lastChatId)
            }
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
        loadChatData()
        // indexedDbから取得
        const loadCashChatData = e => {
            setMessages([{ content: `welcome room${roomId}!` }]);
            // chatIndexDb.findByRoomId(roomId, setMessages)
        }
        loadCashChatData()
    }, [roomId])

    useEffect(() => {
        console.log("loadLastViewedTime")
        if (!roomId || roomId === 0) {
            console.log("cancel loadLastViewedTime")
            return
        }
        if (!userId || userId === 0) {
            console.log("cancel loadLastViewedTime")
            return
        }
        const token = loadJson(`token`)
        const method = "GET";
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-jwt-token': token
        };
        const lastViewedTimeApiUrl = `${chatLastViewedDateApiUrlBase}?roomId=${roomId}&userId=${userId}`
        fetch(lastViewedTimeApiUrl, { method, headers })
            .then(res => res.json())
            .then(e => {
                console.log('loadLastViewedTime Recieved: ')
                setLastViewedDate(e.lastViewedDate)
            })
            .catch()
    }, [roomId, userId])

    const scrollBottom = () => {
        var element = document.documentElement;
        var bottom = element.scrollHeight - element.clientHeight;
        window.scroll(0, bottom)
    }

    return { roomId, setRoomId, messages, setMessages, lastViewedDate }
}
export default useLoadChat