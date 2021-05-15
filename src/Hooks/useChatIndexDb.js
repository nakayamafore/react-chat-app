
const useChatIndexDb = () => {
    const db_constants = {
        name: "chatdb",
        version: 1,
    }
    const store_constants = {
        name: "chat",
        storeOptions: { keyPath: "chatId", autoIncrement: true },
        indexes: [
            { indexName: "chatId", unique: true },
            { indexName: "roomId", unique: false },
        ]
    }
    // IDBに接続する
    const connectIDB = (resolve, reject) => {
        const request = indexedDB.open(db_constants.name, db_constants.version);
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        request.onerror = event => {
            reject(new Error("なぜ私のウェブアプリでIndexedDBを使わせてくれないのですか?!"));
        };
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!Array.from(db.objectStoreNames).includes(store_constants.name)) {
                // store"users"が存在しないとき、新規作成する。
                const objectStore = db.createObjectStore(store_constants.name, store_constants.storeOptions);
                for (const index of store_constants.indexes) {
                    objectStore.createIndex(index.indexName, index.indexName, { unique: index.unique });
                }
            }
        }
    }

    class ChatIndexDb extends Promise {
        // 1行追加する。成功したとき、idを返す。
        put(chat) {
            return new Promise((resolve, reject) => {
                this.then(db => {
                    const transaction = db.transaction(store_constants.name, "readwrite")
                    const objectStore = transaction.objectStore(store_constants.name)
                    const request = objectStore.put(chat)
                    request.onsuccess = event => {
                        resolve(event.target.result)
                    }
                })
            })
        }
        findLastChat() {
            return new Promise((resolve, reject) => {
                this.then(db => {
                    console.log("findLastChat.start")
                    const transaction = db.transaction(store_constants.name, "readonly")
                    const objectStore = transaction.objectStore(store_constants.name)
                    const index = objectStore.index('chatId')
                    const openCursorRequest = index.openCursor(null, "prev")
                    openCursorRequest.onsuccess = event => {
                        console.log("findLastChat.onsuccess")
                        console.log(event.target.result?.value.chatId)
                        resolve(event.target.result?.value.chatId)
                    }
                })
            })
        }
        findByRoomId(roomId, setMessages) {
            this.then(db => {
                console.log("findByRoomId.start")
                const transaction = db.transaction(store_constants.name, "readonly")
                const objectStore = transaction.objectStore(store_constants.name)
                const index = objectStore.index('roomId')
                console.log(roomId)
                const openCursorRequest = index.openCursor(IDBKeyRange.only(roomId), "prev")
                openCursorRequest.onsuccess = event => {
                    console.log("findByRoomId.onsuccess")
                    let cursor = event.target.result;
                    if (cursor) {
                        setMessages(prevMessages => [cursor.value, ...prevMessages])
                        scrollBottom()
                        cursor.continue();
                    }
                }
            })
        }
    }
    const chatIndexDb = new ChatIndexDb(connectIDB);
    return { chatIndexDb }
}
const scrollBottom = () => {
    var element = document.documentElement;
    var bottom = element.scrollHeight - element.clientHeight;
    window.scroll(0, bottom)
}
export default useChatIndexDb