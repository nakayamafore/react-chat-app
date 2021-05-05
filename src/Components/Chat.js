/* eslint-disable no-undef */
import React from "react"
import Navivation from '../Components/Navigation'
import useChat from '../Hooks/useChat'
import dayjs from 'dayjs'
import * as ReactMarkdown from 'react-markdown'
import CodeBlock from '../Components/CodeBlock'
import gfm from 'remark-gfm'
import TextareaAutosize from 'react-textarea-autosize';

export default function Chat() {
    const {
        handleRoomChange, handleInputEnter, handleInputChange, handleSoundChange, handleReactionUpdateClick, handleChatEdit, editChatOnChange, handleChatEdited, handleChatDeleted, getRootProps, uploadFile,
        messages, selectRooms, userId, content, setContent, hasSound, roomUserId
    } = useChat()

    return (
        <div class="wrapper">
            <div className="room-bar">
                {selectRooms && selectRooms.map((data, idx) => {
                    return (<div key={idx} onClick={(e) => handleRoomChange(data.value)}>{data.label}</div>)
                })}
            </div>
            <div className="chat-content">
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
                            const isMime = (data.userId === userId)
                            return (
                                <li className={className} key={idx}>
                                    <div className="pic">
                                        <img src={imageUrl} alt={data} />
                                    </div>
                                    <div className="content">
                                        <div className="edit_bar">
                                            <span className="time">{time}</span>
                                            <button className="edit-button" onClick={(e) => handleChatEdit(e, data.chatId)}
                                                style={{ display: data.editMode || !isMime ? 'none' : '' }}>📝 :編集</button>
                                            <button className="edit-button" onClick={(e) => handleChatDeleted(e, data.chatId)}
                                                style={{ display: data.editMode || !isMime ? 'none' : '' }}>❌ :削除</button>
                                            <button className="edit-button" onClick={(e) => handleChatEdited(e, data.chatId, roomUserId)}
                                                style={{ display: data.editMode && isMime ? '' : 'none' }}>決定</button>
                                        </div>
                                        <TextareaAutosize className="edit-txt" type="text" value={data.content}
                                            onChange={(e) => editChatOnChange(e, data.chatId, idx)}
                                            style={{ display: data.editMode ? '' : 'none' }} />
                                        <ReactMarkdown className="txt" remarkPlugins={gfm} children={data.content} components={CodeBlock} />
                                        <div className="reaction_bar">
                                            <button className="c-reaction" onClick={(e) => handleReactionUpdateClick(e, data.chatId, roomUserId, "nice", data.reactions)}>
                                                👍  {data.reactions?.reduce((p, x) => p + x.nice, 0)}
                                            </button>
                                            <button className="c-reaction" onClick={(e) => handleReactionUpdateClick(e, data.chatId, roomUserId, "look", data.reactions)}>
                                                👀  {data.reactions?.reduce((p, x) => p + x.look, 0)}
                                            </button>
                                        </div>
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
                        uploadAreaProp={getRootProps} uploadFile={uploadFile}
                    />
                </div>
            </div>
        </div>
    );
}
