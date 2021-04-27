/* eslint-disable no-undef */
import React from "react"
import Navivation from '../Components/Navigation'
import useChat from '../Hooks/useChat'
import dayjs from 'dayjs'

export default function Chat() {
    const {
        handleRoomChange, handleInputEnter, handleInputChange, handleButtonClick,
        messages, selectRooms, userId, content
    } = useChat()

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
                            const className = (data.userId === userId) ? "left-side" : "right-side"
                            const imageUrl = (data.userId === userId)
                                ? "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/comander.png"
                                : "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/pregident.png"
                            const time = dayjs(data.createdDatetime).format("HH:mm");
                            console.log(time)
                            return (
                                <li className={className} key={idx}>
                                    <div className="pic">
                                        <img src={imageUrl} alt={data.name} />
                                        <div className="time">{time}</div>
                                    </div>
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
                    <Navivation onSelectChange={handleRoomChange} selectList={selectRooms} />
                </div>
            </div>
        </>
    );
}
