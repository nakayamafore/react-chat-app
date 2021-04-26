import React from "react"
import { Select, MenuItem } from "@material-ui/core"

export default function SelectMenu({
    items = [
        { 'label': 'room change', 'value': 0, 'disabled': true },
        { 'label': 'room1', 'value': 1, 'disabled': false },
        { 'label': 'room2', 'value': 2, 'disabled': false },
    ],
    onChange = e => { },
    value = 0
}) {
    let selectValue = value
    const handleChange = (e) => {
        console.log("selectValue: " + e.target.value)
        onChange(e.target.value)
        selectValue = e.target.value
    };
    return (
        <>
            <Select
                value={selectValue}
                onChange={handleChange}
                displayEmpty
                variant="outlined"
                MenuProps={{
                    getContentAnchorEl: null,
                    anchorOrigin: { vertical: "top", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                }}
            >
                {items.map((item) => {
                    return (
                        <MenuItem key={item.label} value={item.value} disabled={item.disabled} >
                            {item.label}
                        </MenuItem>
                    );
                })}
            </Select>
        </>
    )
}