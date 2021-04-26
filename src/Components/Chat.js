/* eslint-disable no-undef */
import React, { useState, useEffect, useRef, useCallback } from "react"
import SockJS from 'sockjs-client'
import Stomp from 'stomp-websocket'
import Navivation from '../Components/Navigation'
import { InView } from 'react-intersection-observer';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const loadJSON = key => key && JSON.parse(localStorage.getItem(key))
export default function Chat() {
    const [messages, setMessages] = useState([{ content: "welcome room!" }, { content: "please select room" }]);
    const [lastViewedDate, setLastViewedDate] = useState("");
    const [content, setContent] = useState('');
    const [rooms, setRooms] = useState([{}]);
    const [selectRooms, setSelectRooms] = useState([{}]);
    const [roomId, setRoomId] = useState(0);
    const [userId] = useState(loadJSON(`userId`));
    const [roomUserId, setRoomUserId] = useState(0);
    const [isChatSubscribe, setIsChatSubscribe] = useState(false);
    const [isChatStatusSubscribe, setIsChatStatusSubscribe] = useState(false);


    const chatWsUrl = `${API_ENDPOINT}/chat-ws`
    const chatApiUrlBase = `${API_ENDPOINT}/api/chat?roomId=`
    const roomApiUrlBase = `${API_ENDPOINT}/api/roomUsers?userId=`


    useEffect(() => {
        console.log("loadRooms")
        const token = loadJSON(`token`)
        const method = "GET";
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-jwt-token': token
        };
        const roomApiUrl = `${roomApiUrlBase}${userId}`
        console.log(roomApiUrl)
        fetch(roomApiUrl, { method, headers })
            .then(res => res.json())
            .then(e => {
                console.log('Rooms Recieved: ')
                setRooms([...e]);
                console.log("selectRooms: ")
            })
            .catch()
    }, [userId, roomApiUrlBase])

    useEffect(() => {
        console.log('create selectRooms..');
        if (!rooms || rooms.length === 0) {
            console.log("cancel create selectRooms by not exist rooms")
            return
        }
        const selectItems = rooms.map(room => {
            console.log(room)
            return { 'label': room.roomName, 'value': room.roomId, 'disabled': false }
        })
        selectItems.unshift({ 'label': 'room change', 'value': 0, 'disabled': true })
        setSelectRooms(selectItems)
    }, [rooms])

    useEffect(() => {
        console.log("room auto select")
        if (!rooms || rooms.length === 0) {
            console.log("cancel room auto select by not exist rooms")
            return
        }
        if (roomId !== 0) {
            console.log("cancel room auto select by roomId not Zero")
            return
        }
        setRoomId(rooms[0].roomId)
        setRoomUserId(rooms[0].roomUserId)
    }, [rooms, roomId])

    useEffect(() => {
        console.log("loadChats")
        if (!roomId || roomId === 0) {
            console.log("cancel loadChats")
            return
        }
        setMessages([{ content: `welcome room${roomId}!` }]);
        const token = loadJSON(`token`)
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
    }, [roomId, chatApiUrlBase])

    const chatSocket = new SockJS(chatWsUrl);
    let chatClient = Stomp.over(chatSocket);
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
        const token = loadJSON(`token`)
        var headers = {
            "x-jwt-token": token
        };
        setIsChatSubscribe(false)
        chatClient.connect(headers, function () {

            console.log('[[chat Connected:]]');
            const chatSubId = 'chat-subscription-id-001'
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
            const chatStatusSubId = 'chat-status-subscription-id-001'
            var chatStatusHeaders = {
                "x-jwt-token": token,
                "id": chatStatusSubId
            };
            const subscribeId = chatClient.subscribe('/topic/chatStatus', function (payload) {
                console.log('chatStatus Subscribe Recieved: ' + payload.body);
                console.log('roomId, roomUserId: ' + roomId + ", " + roomUserId);
                const json = JSON.parse(payload.body)
                console.log(roomUserId)
                if (json.roomId !== roomId) {
                    console.log("cancel chatStatus Subscribe Recieved: json.roomId: " + json.roomId + ", roomId: " + roomId);
                    return
                }
                if (json.roomUserId === roomUserId) {
                    console.log("cancel chatStatus Subscribe Recieved: json.roomUserId: " + json.roomUserId);
                    return
                }
                console.log('[update lastViewedDate]: ' + json.lastViewedDate);
                setLastViewedDate(json.lastViewedDate);
            }, chatStatusHeaders);
            console.log(`subscribeId :${subscribeId}`)
            setIsChatStatusSubscribe(subscribeId ? true : false)
            handleViewEvent()
        });
        // return () => {
        //     console.log('Disconnecting..');
        //     stompClient.disconnect();
        // };
    }, [roomUserId]);

    const handleButtonClick = (e) => {
        const aMessage = {
            roomUserId,
            content,
        };
        console.log("chat message-send")
        console.log(aMessage)
        const token = loadJSON(`token`)
        var chatHeaders = {
            "x-jwt-token": token,
            // "id": chatSubId
        };

        chatClient.send("/app/chat", chatHeaders, JSON.stringify(aMessage));
        setContent('');
    }

    // const statusSocket = new SockJS(chatWsUrl);
    // const statusClient = Stomp.over(statusSocket);
    // const chatStatusSubId = 'chat-status-subscription-id-001'
    // useEffect(() => {
    //     console.log('chatStatus Connectinng..');
    //     console.log('roomUserId :' + roomUserId)
    //     if (isChatStatusSubscribe) {
    //         console.log('cancel chatStatus Connectinng.. still connect');
    //         return
    //     }
    //     if (!roomUserId || roomUserId === 0) {
    //         console.log('cancel chatStatus Connectinng..');
    //         return
    //     }
    //     const token = loadJSON(`token`)
    //     var headers = {
    //         "x-jwt-token": token
    //     };
    //     statusClient.connect(headers, function () {
    //         console.log('[[chatStatus Connected:]]');
    //         setIsChatStatusSubscribe(false)
    //         var chatStatusHeaders = {
    //             "x-jwt-token": token,
    //             "id": chatStatusSubId
    //         };
    //         const subscribeId = statusClient.subscribe('/topic/chatStatus', function (payload) {
    //             console.log('chatStatus Subscribe Recieved: ' + payload.body);
    //             console.log('roomId, roomUserId: ' + roomId + ", " + roomUserId);
    //             const json = JSON.parse(payload.body)
    //             console.log(roomUserId)
    //             if (json.roomId !== roomId) {
    //                 console.log("cancel chatStatus Subscribe Recieved: json.roomId: " + json.roomId + ", roomId: " + roomId);
    //                 return
    //             }
    //             if (json.roomUserId === roomUserId) {
    //                 console.log("cancel chatStatus Subscribe Recieved: json.roomUserId: " + json.roomUserId);
    //                 return
    //             }
    //             console.log('[update lastViewedDate]: ' + json.lastViewedDate);
    //             setLastViewedDate(json.lastViewedDate);
    //         }, chatStatusHeaders);
    //         console.log(`subscribeId :${subscribeId}`)
    //         setIsChatStatusSubscribe(subscribeId ? true : false)
    //     });
    //     // return () => {
    //     //     console.log('Disconnecting..');
    //     //     stompClient.disconnect();
    //     // };
    // }, [roomUserId, roomId]);

    const handleViewEvent = async (e) => {
        console.log("handleViewEvent isChatStatusSubscribe :" + isChatStatusSubscribe)
        if (!isChatStatusSubscribe) return
        await new Promise(resolve => {
            console.log("handleViewEvent sleep")
            setTimeout(resolve, 1000)
        })
        const body = {
            roomUserId,
            roomId
        };
        console.log("chatStatus message-send")
        console.log(body)
        const token = loadJSON(`token`)
        var chatStatusHeaders = {
            "x-jwt-token": token,
            // "id": chatStatusSubId
        };
        chatClient.send("/app/chatStatus", chatStatusHeaders, JSON.stringify(body));
    }

    const handleInputChange = (e) => {
        console.log(e.target.value)
        setContent(e.target.value);
    };

    const handleInputEnter = (e) => {
        if (e.keyCode === 13) {
            console.log("handleInputEnter=enter")
            handleButtonClick()
        }
    }
    const handleRoomChange = (roomId) => {
        console.log("handleRoomChange :" + roomId)
        const targetRoom = rooms.filter(e => e.roomId === roomId)[0]
        console.log(targetRoom)
        setRoomId(targetRoom.roomId)
        setRoomUserId(targetRoom.roomUserId)
    }

    return (
        <>
            <div>
                {messages && <ul className="messages" id="message">
                    {
                        messages.map((data, idx) => {
                            if (!data) {
                                <li key={idx}>
                                    <div className="pic"></div>
                                    <div className="txt">--no-data--</div>
                                </li>
                            }
                            const isRead = (data.createdDatetime < lastViewedDate)
                            const className = (data.userId === userId) ? "left-side" : "right-side"
                            const imageUrl = (data.userId === userId)
                                ? "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/comander.png"
                                : "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/pregident.png"
                            return (
                                <InView onChange={(inView, entry) => {
                                    if (!isRead && inView) {
                                        handleViewEvent()
                                    }
                                }}>
                                    <li className={className} key={idx}>
                                        <div className="pic">
                                            <img src={imageUrl} alt={data.name} />
                                            {(isRead) && <div>既読</div>}
                                        </div>
                                        <div className="txt">{data.content}</div>
                                    </li>
                                </InView>
                            );
                        })
                    }
                </ul>}
                <div className="input-fooder">
                    <input className="input-text" type="text" placeholder="メッセージ" value={content}
                        onChange={handleInputChange} onKeyDown={handleInputEnter} />
                    <button className="send-button" disabled={!content} onClick={handleButtonClick}>送信</button>
                    <Navivation onSelectChange={handleRoomChange} selectList={selectRooms} />
                </div>
            </div>
        </>
    );
}
