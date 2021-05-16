import { useEffect } from "react"
import noticeSound from "../Sound/jr.mp3"
const usePushNotice = (setHasSound) => {
    useEffect(() => {
        if ("Notification" in window) {
            // 通知が許可されていたらキャンセル
            const permission = Notification.permission;
            if (permission === "denied" || permission === "granted") {
                return;
            }
            // 通知の許可を求める
            Notification.requestPermission().then(() => new Notification("welcome ~~~"));
        }
    }, []);

    const handlePushNotif = (hasSound, message = "通知を受信しました！") => {
        console.log("handlePushNotif")
        console.log("hasSound-usePushNotice.js :" + hasSound)
        if ("Notification" in window) { // 通知に対応しているか？
            const notif = new Notification('from Chat', {
                body: message,
                image: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/pregident.png",
                icon: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/pregident.png",
                badge: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/pregident.png"
            });
            // プッシュ通知が表示された時に起きるイベント
            notif.addEventListener("show", () => {
                //console.log("handlePushNotif - sound: " + hasSound)
                // 状態によって音の有無を変える
                if (hasSound) {
                    // 音再生
                    new Audio(noticeSound).play();
                }
            });
        }
    };
    const handleSoundChange = () => setHasSound((prev) => !prev)

    return { handleSoundChange, handlePushNotif }
}
export default usePushNotice