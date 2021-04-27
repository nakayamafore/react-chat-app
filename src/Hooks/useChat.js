import { useState, useEffect } from "react"
import useLoadRooms from '../Hooks/useLoadRooms'
import useLoadChat from '../Hooks/useLoadChat'
import useChatWs from '../Hooks/useChatWs'

const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useChat = () => {
    const { userId, rooms } = useLoadRooms()
    const { roomId, setRoomId, messages, setMessages } = useLoadChat()
    const { roomUserId, setRoomUserId, chatClient } = useChatWs(roomId, setMessages)
    const [content, setContent] = useState('');
    const [selectRooms, setSelectRooms] = useState([{}]);

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
    }, [rooms, roomId, setRoomId, setRoomUserId])

    const handleButtonClick = (e) => {
        const aMessage = {
            roomUserId,
            content,
        };
        console.log("chat message-send")
        console.log(aMessage)
        const token = loadJson(`token`)
        var chatHeaders = {
            "x-jwt-token": token,
        };

        chatClient.send("/app/chat", chatHeaders, JSON.stringify(aMessage));
        setContent('');
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
    return {
        handleRoomChange, handleInputEnter, handleInputChange, handleButtonClick,
        messages, selectRooms, userId, content
    }
}
export default useChat