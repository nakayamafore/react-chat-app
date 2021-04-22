/* eslint-disable no-undef */
import React, { useState, useEffect } from "react"
import SockJS from 'sockjs-client'
import Stomp from 'stomp-websocket'

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const chatWsUrl = `${API_ENDPOINT}/chat-ws`
const chatApiUrlBase = `${API_ENDPOINT}/api/chat?roomId=`
const roomApiUrlBase = `${API_ENDPOINT}/api/roomUsers?userId=`
const socket = new SockJS(chatWsUrl);
const loadJSON = key => key && JSON.parse(localStorage.getItem(key))
export default function Chat() {
    const [messages, setMessages] = useState([{ content: "welcome room!" }]);
    const [content, setContent] = useState('');
    const [, setRooms] = useState([{}]);
    const [roomId, setRoomId] = useState(1);
    const [userId] = useState(loadJSON(`userId`));
    const [roomUserId, setRoomUserId] = useState(1);

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
                setRooms(prevRooms => [...prevRooms, ...e]);
                setRoomId(e[0].roomId)
                setRoomUserId(e[0].roomUserId)
            })
            .catch()
    }, [userId])

    useEffect(() => {
        console.log("loadChats")
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
    }, [roomId])

    useEffect(() => {
        console.log('Connectinng..');
        let stompClient = Stomp.over(socket);
        const token = loadJSON(`token`)
        var headers = {
            "x-jwt-token": token
        };
        stompClient.connect(headers, function (frame) {
            console.log('Connected: ');
            stompClient.subscribe('/topic/greetings', function (payload) {
                console.log('Subscribe Recieved: ' + payload.body);
                setMessages(prevMessages => [...prevMessages, JSON.parse(payload.body)]);
                var element = document.documentElement;
                var bottom = element.scrollHeight - element.clientHeight;
                window.scroll(0, bottom);
            }, headers);
        });
        // return () => {
        //     console.log('Disconnecting..');
        //     stompClient.disconnect();
        // };
    }, [roomUserId]);

    const handleInputChange = (e) => {
        console.log(e.target.value)
        setContent(e.target.value);
    };

    const handleButtonClick = (e) => {
        const aMessage = {
            roomUserId,
            content,
        };
        console.log("message-send")
        console.log(aMessage)
        let stompClient = Stomp.over(socket);
        const token = loadJSON(`token`)
        var headers = {
            "x-jwt-token": token
        };
        stompClient.send("/app/hello", headers, JSON.stringify(aMessage));
        setContent('');
    }

    const handleInputEnter = (e) => {
        if (e.keyCode === 13) {
            console.log("handleInputEnter=enter")
            handleButtonClick()
        }
    }
    console.log(messages)

    return (
        <div>
            { messages && <ul className="messages">
                {
                    messages.map((data, idx) => {
                        if (!data) {
                            <li key={idx}>
                                <div className="pic"></div>
                                <div className="txt">--no-data--</div>
                            </li>
                        }
                        const className = (data.userId === userId) ? "left-side" : "right-side"
                        const imageUrl = (data.userId === userId)
                            ? "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/comander.png"
                            : "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/pregident.png"
                        return (
                            <li className={className} key={idx}>
                                <div className="pic"><img src={imageUrl} alt={data.name} /></div>
                                <div className="txt">{data.content}</div>
                            </li>
                        );
                    })
                }
            </ul>}
            <div className="input-fooder">
                <input className="input-text" type="text" placeholder="メッセージ" value={content}
                    onChange={handleInputChange} onKeyDown={handleInputEnter} />
                <button className="send-button" disabled={!content} onClick={handleButtonClick}>送信</button>
            </div>
        </div>
    );
}