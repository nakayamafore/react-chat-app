import { useState, useEffect } from "react"
import useLoadRooms from '../Hooks/useLoadRooms'
import useLoadChat from '../Hooks/useLoadChat'
import useChatWs from '../Hooks/useChatWs'
import usePushNotice from '../Hooks/usePushNotice'
import useUpload from '../Hooks/useUpload'

const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useChat = () => {
    const { userId, rooms } = useLoadRooms()
    const { roomId, setRoomId, messages, setMessages } = useLoadChat()
    const { handleSoundChange, handlePushNotif, hasSound } = usePushNotice()
    const { roomUserId, setRoomUserId, chatClient } = useChatWs(roomId, setMessages, handlePushNotif)
    const [content, setContent] = useState('')
    const { uploadFile, setUploadfile, getRootProps, onPasteImageUpload } = useUpload(setContent)
    const [selectRooms, setSelectRooms] = useState([{}])

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

    const handleInsertClick = async (e) => {
        const aMessage = {
            functionType: "I",
            roomUserId,
            content,
        };
        console.log("chat message-send")
        console.log(aMessage)
        const token = loadJson(`token`)
        var chatHeaders = {
            "x-jwt-token": token,
        };

        await chatClient.send("/app/chat", chatHeaders, JSON.stringify(aMessage));
        setContent('');
    }

    const handleReactionUpdateClick = async (e, chatId, roomUserId, actionName, prevReactions = []) => {
        console.log("handleUpdateClick")
        console.log(e)
        console.log(chatId)
        let target = prevReactions.find(m => m.roomUserId === roomUserId)
        let reactions
        if (target) {
            console.log("target && target[actionName]")
            target[actionName] ? target[actionName] = 0 : target[actionName] = 1
            reactions = [...prevReactions]
        } else {
            reactions = [...prevReactions, { roomUserId, [actionName]: 1 }]
        }
        const request = {
            functionType: "U",
            roomUserId,
            chatId,
            reactions
        };
        const token = loadJson(`token`)
        var chatHeaders = {
            "x-jwt-token": token,
        };

        await chatClient.send("/app/chat", chatHeaders, JSON.stringify(request));
        setContent('')
        setUploadfile([])
    }

    const handleInputChange = (e) => {
        setContent(e.target.value);
    };

    const handleInputEnter = (e) => {
        // console.log("[e.shiftKey, e.ctrlKey, e.metaKey, e.keyCode] :[" + e.shiftKey + ", " + e.ctrlKey + ", " + e.metaKey + ", " + e.keyCode + "]")
        // enter処理
        if (e.shiftKey === false && e.keyCode === 13) {
            console.log("handleInputEnter=enter")
            e.stopPropagation()
            handleInsertClick()
        }
        // ペースト処理
        if (((e.ctrlKey && !e.metaKey) || (!e.ctrlKey && e.metaKey)) && e.keyCode === 86) {
            console.log("handleInputEnter=ctrl+v")
            e.stopPropagation()
            onPasteImageUpload(e)
        }
    }
    const handleRoomChange = (roomId) => {
        console.log("handleRoomChange :" + roomId)
        const targetRoom = rooms.filter(e => e.roomId === roomId)[0]
        console.log(targetRoom)
        setRoomId(targetRoom.roomId)
        setRoomUserId(targetRoom.roomUserId)
    }

    const handleChatEdit = (e, chatId) => {
        console.log("handleChatEdit :" + chatId)
        setMessages(prevMessages => {
            let targetMessage = prevMessages.find(e => e.chatId === chatId)
            targetMessage.editMode = true
            return [...prevMessages]
        });
    }
    const editChatOnChange = (e, chatId, idx) => {
        console.log("editChatOnChange :" + chatId + ", e.target.value :" + e.target.value + ", idx :" + idx)
        setMessages(prevMessages => {
            let targetMessage = prevMessages.find(e => e.chatId === chatId)
            targetMessage.content = e.target.value
            return [...prevMessages]
        });
        console.log(messages)
    }
    const handleChatEdited = async (e, chatId) => {
        console.log("handleChatEdited :" + chatId)
        let target = messages.find(m => m.chatId === chatId)
        const request = {
            functionType: "U",
            roomUserId,
            chatId: target.chatId,
            content: target.content,
        };
        const token = loadJson(`token`)
        var chatHeaders = {
            "x-jwt-token": token,
        };

        await chatClient.send("/app/chat", chatHeaders, JSON.stringify(request));

        setMessages(prevMessages => {
            let targetMessage = prevMessages.find(e => e.chatId === chatId)
            targetMessage.editMode = false
            return [...prevMessages]
        });
    }
    const handleChatDeleted = async (e, chatId) => {
        console.log("handleChatDeleted :" + chatId)
        const request = {
            functionType: "D",
            roomUserId,
            chatId: chatId
        };
        const token = loadJson(`token`)
        var chatHeaders = {
            "x-jwt-token": token,
        };

        await chatClient.send("/app/chat", chatHeaders, JSON.stringify(request));

        setMessages(prevMessages => {
            let replaceMessage = prevMessages.filter(e => e.chatId !== chatId)
            return [...replaceMessage]
        });
    }

    return {
        handleRoomChange, handleInputEnter, handleInputChange,
        handleInsertClick, handleReactionUpdateClick, handleSoundChange,
        handleChatEdit, editChatOnChange, handleChatEdited, handleChatDeleted, getRootProps, uploadFile,
        messages, selectRooms, userId, content, setContent, hasSound, roomUserId
    }
}
export default useChat