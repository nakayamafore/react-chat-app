import React from "react"
import TextareaAutosize from 'react-textarea-autosize';
import * as ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import CodeBlock from '../Components/CodeBlock'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import { useInView } from 'react-intersection-observer';

const ChatBlock = ({ data, roommates, userId, roomUserId, idx,
    handleChatEdit, handleChatDeleted, handleChatEdited, editChatOnChange, handleReactionUpdateClick, handleVieded
}) => {
    const [ref, inView] = useInView({
        rootMargin: '0px 0px',
    })
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.tz.setDefault('Asia/Tokyo')

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
    const time = dayjs(data.createdDatetime).tz().format("M[/]D HH:mm");
    const isMime = (data.userId === userId)
    const userName = roommates.find(e => e.userId === data.userId)?.userName;
    const isRead = data.createdDatetime < data.lastViewedDate
    if (inView && !isRead && !isMime) {
        handleVieded(data.chatId)
    }
    return (
        <>
            <li className={className} key={idx}>
                <div className="pic">
                    <img src={imageUrl} alt={data} />
                </div>
                <div className="content" ref={ref}>
                    <div className="edit_bar">
                        <span className="name">{userName}</span>
                        <span className="time">{time}</span>
                        <span className="name" style={{ display: isRead ? '' : 'none' }}>既読</span>
                        <button className="edit-button" onClick={(e) => handleChatEdit(e, data.chatId)}
                            style={{ display: data.editMode || !isMime ? 'none' : '' }}>📝 :編集</button>
                        <button className="edit-button" onClick={(e) => handleChatDeleted(e, data.chatId)}
                            style={{ display: data.editMode || !isMime ? 'none' : '' }}>❌ :削除</button>
                        <button className="edit-button" onClick={(e) => handleChatEdited(e, data.chatId, roomUserId)}
                            style={{ display: data.editMode && isMime ? '' : 'none' }}>決定</button>
                    </div>
                    <TextareaAutosize className="edit-txt" type="text" value={data.content || ''}
                        onChange={(e) => editChatOnChange(e, data.chatId, idx)}
                        style={{ display: data.editMode ? '' : 'none' }} />
                    <ReactMarkdown className="txt" parserOptions={{ commonmark: true }} remarkPlugins={[gfm]} children={data.content} components={CodeBlock} />
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
        </>)
}
export default ChatBlock