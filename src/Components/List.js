import React from "react"

const TableRow = ({ target = [] }) => {
    if (!target) { return (<tr ><td>no data</td></tr>) }
    return (<>
        {target.map((e, i) => {
            return (<tr key={i}>
                <td>{e.userId}</td>
                <td>{e.email}</td>
                <td>{e.userName}</td>
                <td>{e.role}</td>
            </tr>)
        })}
    </>);
}
export default function List({ data = [] }) {
    return (
        <table style={{ border: "2px #808080 solid" }}>
            <thead>
                <tr style={{ border: "2px #808080 solid" }}>
                    <th>userId</th>
                    <th>email</th>
                    <th>userName</th>
                    <th>role</th>
                </tr>
            </thead>
            <tbody><TableRow target={data} /></tbody>
        </table >
    )
}