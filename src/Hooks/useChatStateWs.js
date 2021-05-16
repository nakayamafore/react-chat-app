import { useEffect } from "react"
import SockJS from 'sockjs-client'
import Stomp from 'stomp-websocket'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatWsUrl = `${API_ENDPOINT}/chat-ws`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useChatStateWs = (roomUserId, roomId, userId, subscribeFiler = e => e, lastViewedDate, setLastViewedDate = e => e) => {

    useEffect(() => {
        console.log('chat　Connectinng..');
        console.log('roomUserId :' + roomUserId)
        if (!roomUserId || roomUserId === 0) {
            console.log('cancel Connectinng..');
            return
        }
        const chatSocket = new SockJS(chatWsUrl);
        const chatStateClient = Stomp.over(chatSocket);
        const token = loadJson(`token`)
        var headers = {
            "x-jwt-token": token
        };
        chatStateClient.connect(headers, function () {
            console.log('[[chatState Connected]]');
            const chatStateSubId = 'chat-sub-id-002'
            var chatStateHeaders = {
                "x-jwt-token": token,
                "id": chatStateSubId
            };
            chatStateClient.subscribe(`/user/${userId}/topic/chatStatus`, function (payload) {
                console.log('==chatStatus Subscribe Recieved: ' + payload.body);
                const json = JSON.parse(payload.body)
                console.log(json);
                if (!subscribeFiler(json.roomId)) {
                    console.log("==cancel Subscribe Recieved: json.roomId: " + json.roomId + ", roomId: " + roomId);
                    return
                }
                console.log("==chatStatus Subscribe Recieved lastViewedDate");
                setLastViewedDate(pre => json.lastViewedDate)
                console.log(lastViewedDate);
            }, chatStateHeaders)
        });
        return () => {
            console.log('[[chatState Disconnecting..]]')
            if (chatStateClient && chatStateClient.ws.readyState === 1) {
                chatStateClient.disconnect()
            }
        };
    }, [roomUserId, roomId]);

    return { lastViewedDate, setLastViewedDate }
}
export default useChatStateWs