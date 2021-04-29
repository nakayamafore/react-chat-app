import React from "react"
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core"
import SelectMenu from '../Components/SelectMenu'
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => createStyles({
    root: {
        backgroundColor: '#e6e6fa',
    },
}));

export default function Navigation({
    onSelectChange = e => e, selectList = {}, onSoundChange = e => e, hasSound = false,
    inputContent = "", inputOnChange = e => e, inputOnKeyDown = e => e
}) {
    const classes = useStyles();
    return (<BottomNavigation className={classes.root}
        onChange={(event, newValue) => {
            // setValue(newValue);
            console.log(newValue)
        }}
        showLabels
    >
        <BottomNavigationAction icon={<SelectMenu onChange={onSelectChange} items={selectList} />} />
        <BottomNavigationAction icon={<textarea className="input-text" type="text" placeholder="メッセージ"
            value={inputContent} onChange={inputOnChange} onKeyDown={inputOnKeyDown} />} />
        <BottomNavigationAction icon={
            hasSound
                ? <VolumeUpIcon onClick={onSoundChange} />
                : <VolumeOffIcon onClick={onSoundChange} />} />
    </BottomNavigation>)
}