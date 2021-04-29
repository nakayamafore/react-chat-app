/* eslint-disable no-undef */
import React from "react"
import Navivation from '../Components/Navigation'
import useChat from '../Hooks/useChat'
import dayjs from 'dayjs'
import * as ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export default function Chat() {
    const {
        handleRoomChange, handleInputEnter, handleInputChange, handleSoundChange,
        messages, selectRooms, userId, content, hasSound
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
                            return (
                                <li className={className} key={idx}>
                                    <div className="pic">
                                        <img src={imageUrl} alt={data.name} />
                                        <div className="time">{time}</div>
                                    </div>
                                    <ReactMarkdown className="txt" remarkPlugins={gfm} children={data.content}></ReactMarkdown>
                                    {/* <div className="txt">{data.content}</div> */}
                                </li>
                            );
                        })
                    }
                </ul>}
                <div className="input-fooder">
                    <Navivation onSelectChange={handleRoomChange} selectList={selectRooms}
                        onSoundChange={handleSoundChange} hasSound={hasSound}
                        inputContent={content} inputOnChange={handleInputChange} inputOnKeyDown={handleInputEnter}
                    />
                </div>
            </div>
        </>
    );
}
