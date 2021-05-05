import React, { useState } from "react"
import TextareaAutosize from 'react-textarea-autosize';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';


const useStyles = makeStyles((theme) => createStyles({
    root: {
        backgroundColor: '#fafafa',
    },
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));
function getModalStyle() {
    return {
        top: `50%`,
        left: `50%`,
        transform: `translate(25%, 50%)`,
    };
}

export default function Navigation({
    onSelectChange = e => e, selectList = {}, onSoundChange = e => e, hasSound = false,
    inputContent = "", setInputContent = e => e, inputOnChange = e => e, inputOnKeyDown = e => e,
    uploadAreaProp = e => e, uploadFile = []
}) {
    const classes = useStyles()
    const [modalStyle] = useState(getModalStyle)
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className="input-fooder">
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <Picker style={modalStyle} className={classes.paper} onSelect={emoji => {
                    // alert(JSON.stringify(emoji));
                    console.log("==setEmoji")
                    handleClose()
                    setInputContent(inputContent + emoji.native)
                }} />
            </Modal>
            <div className="input-container">
                <div {...uploadAreaProp({ className: 'dropzone' })}>
                    <TextareaAutosize className="input-text" type="text" placeholder="メッセージ"
                        value={inputContent} onChange={inputOnChange} onKeyDown={inputOnKeyDown} />
                </div>
            </div>
            <div className="icon-select-button"><EmojiEmotionsIcon onClick={handleOpen} /></div>
            <div className="volume-togle-button">{hasSound
                ? <VolumeUpIcon onClick={onSoundChange} />
                : <VolumeOffIcon onClick={onSoundChange} />}</div>
        </div>)
}