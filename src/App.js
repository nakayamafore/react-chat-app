import './App.css';
import React, { useEffect, useState } from "react"
import { GraphQLClient } from "graphql-request"
import List from "./Components/List"

const queryUserAll = `
query UsersQuery {
  userAll {
    userId
    email
    userName
    role
  }
}`
const client = new GraphQLClient("http://localhost:8080/graphql")
export default function App() {
  const [user, setUser] = useState([])
  useEffect(() => {
    client.request(queryUserAll, {})
      .then(results => {
        const { userAll } = results
        setUser(userAll)
      })
      .catch(console.error);
  }, [])

  return (
    <div className="App">
      <List data={user}></List>
    </div>
  );
}
