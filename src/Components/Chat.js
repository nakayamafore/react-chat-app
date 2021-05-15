/* eslint-disable no-undef */
import loading from '../loading.gif';
import React, { lazy, Suspense } from "react"
import Navivation from '../Components/Navigation'
import useChat from '../Hooks/useChat'

const ChatBlock = lazy(() => import('../Components/ChatBlock'))
export default function Chat() {
    const {
        handleRoomChange, handleInputEnter, handleInputChange, handleSoundChange, handleReactionUpdateClick, handleChatEdit, editChatOnChange, handleChatEdited, handleChatDeleted, handleVieded, getRootProps, uploadFile,
        messages, selectRooms, roommates, lastViewedDate, userId, content, setContent, hasSound, roomUserId
    } = useChat()

    return (
        <div className="wrapper">
            <div className="room-bar">
                {selectRooms && selectRooms.map((data, idx) => {
                    return (<div key={idx} onClick={(e) => handleRoomChange(data.value)}>{data.label}</div>)
                })}
            </div>
            <div className="chat-content">

                {messages && <ul className="messages" id="message">
                    {
                        messages.map((data, idx) => {
                            return (
                                <Suspense fallback={<div><img src={loading} alt="" /></div>}>
                                    <ChatBlock data={data} roommates={roommates} userId={userId} roomUserId={roomUserId}
                                        idx={idx} handleChatEdit={handleChatEdit} handleChatDeleted={handleChatDeleted}
                                        handleChatEdited={handleChatEdited} editChatOnChange={editChatOnChange}
                                        handleReactionUpdateClick={handleReactionUpdateClick} handleVieded={handleVieded} lastViewedDate={lastViewedDate} />
                                </Suspense>
                            )

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
