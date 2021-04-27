import { useState, useEffect } from "react"
import SockJS from 'sockjs-client'
import Stomp from 'stomp-websocket'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatWsUrl = `${API_ENDPOINT}/chat-ws`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useChatWs = (roomId, setMessages) => {

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
            chatClient.subscribe('/topic/greetings', function (payload) {
                console.log('==chat Subscribe Recieved: ' + payload.body);
                const json = JSON.parse(payload.body)
                console.log(json);
                if (json.roomId !== roomId) {
                    console.log("==cancel Subscribe Recieved: json.roomId: " + json.roomId + ", roomId: " + roomId);
                    return
                }
                console.log("==chat Subscribe Recieved setMessages");
                setMessages(prevMessages => [...prevMessages, json]);
                var element = document.documentElement;
                var bottom = element.scrollHeight - element.clientHeight;
                window.scroll(0, bottom);
            }, chatHeaders)
        });
        return () => {
            console.log('[[chat Disconnecting..]]');
            chatClient.disconnect();
        };
    }, [roomUserId]);

    return { roomUserId, setRoomUserId, chatClient }
}
export default useChatWs