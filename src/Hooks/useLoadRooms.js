import { useState, useEffect } from "react"

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const roomApiUrlBase = `${API_ENDPOINT}/api/roomUsers?userId=`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useLoadRooms = () => {
    const [userId] = useState(loadJson(`userId`));
    const [rooms, setRooms] = useState([{}]);

    useEffect(() => {
        console.log("loadRooms")
        const token = loadJson(`token`)
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
    }, [userId])

    return { userId, rooms }
}
export default useLoadRooms