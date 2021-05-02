/* eslint-disable no-undef */
import React from "react"
import Navivation from '../Components/Navigation'
import useChat from '../Hooks/useChat'
import dayjs from 'dayjs'
import * as ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import Button from '@material-ui/core/Button'

export default function Chat() {
    const {
        handleRoomChange, handleInputEnter, handleInputChange, handleSoundChange, handleReactionUpdateClick, handleChatEdit, editChatOnChange, handleChatEdited, displayChatEdit,
        messages, selectRooms, userId, content, setContent, hasSound, roomUserId
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
                                        <img src={imageUrl} alt={data} />
                                        <div className="time">{time}</div>
                                    </div>
                                    <div className="content">
                                        <ReactMarkdown className="txt" remarkPlugins={gfm} children={data.content}></ReactMarkdown>
                                        <textarea className="txt" type="text" value={data.content}
                                            onChange={(e) => editChatOnChange(e, data.chatId, idx)}
                                            style={{ display: data.editMode ? '' : 'none' }} />
                                        <Button variant="contained" color="primary"
                                            onClick={(e) => handleChatEdited(e, data.chatId, roomUserId)}
                                            style={{ display: data.editMode ? '' : 'none' }}>決定</Button>
                                    </div>
                                    <div className="pic">
                                        <Button variant="contained" color="primary" onClick={(e) => handleChatEdit(e, data.chatId)}>
                                            📝
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={(e) => handleReactionUpdateClick(e, data.chatId, roomUserId, "nice", data.reactions)}>
                                            👍 :{data.reactions?.reduce((p, x) => p + x.nice, 0)}
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={(e) => handleReactionUpdateClick(e, data.chatId, roomUserId, "look", data.reactions)}>
                                            👀 :{data.reactions?.reduce((p, x) => p + x.look, 0)}
                                        </Button>
                                    </div>
                                </li>
                            );
                        })
                    }
                </ul>}
                <div className="input-fooder">
                    <Navivation onSelectChange={handleRoomChange} selectList={selectRooms}
                        onSoundChange={handleSoundChange} hasSound={hasSound}
                        inputContent={content} setInputContent={setContent} inputOnChange={handleInputChange} inputOnKeyDown={handleInputEnter}
                    />
                </div>
            </div>
        </>
    );
}
