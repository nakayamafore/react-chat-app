import React from "react"
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core"
import SelectMenu from '../Components/SelectMenu'

export default function Navigation({ onSelectChange = e => e, selectList = {} }) {
    return (<BottomNavigation
        onChange={(event, newValue) => {
            // setValue(newValue);
            console.log(newValue)
        }}
        showLabels
    >
        <BottomNavigationAction icon={<SelectMenu onChange={onSelectChange} items={selectList} />} />
    </BottomNavigation>)
}