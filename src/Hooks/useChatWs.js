import { useState, useEffect } from "react"
import SockJS from 'sockjs-client'
import Stomp from 'stomp-websocket'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatWsUrl = `${API_ENDPOINT}/api/chat-ws`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useChatWs = (roomId, userId, setMessages, handlePushNotif = e => e, subscribeFiler = e => e, setLastViewedDate = e => e, hasSound) => {

    const [isChatSubscribe, setIsChatSubscribe] = useState(false);
    const [roomUserId, setRoomUserId] = useState(0);

    const chatSocket = new SockJS(chatWsUrl);
    const chatClient = Stomp.over(chatSocket);
    useEffect(() => {
        console.log('chat　Connectinng..');
        console.log('roomUserId :' + roomUserId)
        if (isChatSubscribe) {
            console.log('cancel Connectinng by isChatSubscribe..');
            return
        }
        if (!roomUserId || roomUserId === 0) {
            console.log('cancel Connectinng..');
            return
        }
        const token = loadJson(`token`)
        var headers = {
            "x-jwt-token": token
        };
        setIsChatSubscribe(false)
        chatClient.connect(headers, function () {
            console.log('[[chat Connected]]');
            const chatSubId = 'chat-sub-id-001'
            var chatHeaders = {
                "x-jwt-token": token,
                "id": chatSubId
            };
            chatClient.subscribe(`/api/user/${userId}/topic/greetings`, function (payload) {
                console.log('==chat Subscribe Recieved: ' + payload.body);
                const json = JSON.parse(payload.body)
                console.log(json);
                if (!subscribeFiler(json.roomId)) {
                    console.log("==cancel Subscribe Recieved: json.roomId: " + json.roomId + ", roomId: " + roomId);
                    return
                }
                console.log("==chat Subscribe Recieved setMessages");
                if (json.functionType === "I") {
                    setMessages(prevMessages => [...prevMessages, json]);
                    scrollBottom()
                    handlePushNotif(hasSound, json.content)
                } else if (json.functionType === "U") {
                    setMessages(prevMessages => {
                        let target = prevMessages.find(m => m.chatId === json.chatId)
                        target.reactions = json.reactions
                        target.content = json.content ? json.content : target.content
                        return [...prevMessages]
                    });
                } else if (json.functionType === "D") {
                    setMessages(prevMessages => {
                        let replaceMessage = prevMessages.filter(e => e.chatId !== json.chatId)
                        return [...replaceMessage]
                    });
                }

            }, chatHeaders)
            const chatStateSubId = 'chat-sub-id-002'
            var chatStateHeaders = {
                "x-jwt-token": token,
                "id": chatStateSubId
            };
            chatClient.subscribe(`/api/user/${userId}/topic/chatStatus`, function (payload) {
                console.log('==chatStatus Subscribe Recieved: ' + payload.body);
                const json = JSON.parse(payload.body)
                console.log(json);
                if (!subscribeFiler(json.roomId)) {
                    console.log("==cancel Subscribe Recieved: json.roomId: " + json.roomId + ", roomId: " + roomId);
                    return
                }
                console.log("==chatStatus Subscribe Recieved lastViewedDate");
                setMessages(prevMessages => {
                    let target = prevMessages.find(m => m.chatId === json.chatId)
                    target.reactions = json.reactions
                    target.lastViewedDate = json.lastViewedDate ? json.lastViewedDate : target.lastViewedDate
                    return [...prevMessages]
                });
                setLastViewedDate(json.lastViewedDate)
            }, chatStateHeaders)
        });
        return () => {
            console.log('[[chat Disconnecting..]]')
            if (chatClient && chatClient.ws.readyState === 1) {
                chatClient.disconnect()
            }
        };
    }, [roomUserId, roomId, hasSound]);

    const scrollBottom = () => {
        var element = document.documentElement;
        var bottom = element.scrollHeight - element.clientHeight;
        window.scroll(0, bottom)
    }

    return { roomUserId, setRoomUserId, chatClient }
}
export default useChatWs