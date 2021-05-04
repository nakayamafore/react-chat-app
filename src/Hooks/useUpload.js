import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone';
import uuid from 'react-uuid'
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const fileUploadApiUrl = `${API_ENDPOINT}/api/upload`
const loadJson = key => key && JSON.parse(localStorage.getItem(key))
const useUpload = (setContent = e => e) => {
    const [uploadFile, setUploadfile] = useState([])

    const onDropFile = useCallback(acceptedFiles => {
        console.log("onDrop")
        acceptedFiles.forEach((file, key) => {
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                const token = loadJson(`token`)
                const method = "POST";
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-jwt-token': token
                };
                const obj = { fileName: file.name, base64Url: reader.result };
                const body = JSON.stringify(obj);
                fetch(fileUploadApiUrl, { method, headers, body })
                    .then(res => res.json())
                    .then(e => {
                        console.log('Upload success: ')
                        setUploadfile(prevFile => [...prevFile, e])
                        setContent(content => content + convertMarkdownUploadFileUrl(e))
                    })
                    .catch()
            }
        })
    }, [])

    const onPasteImageUpload = e => {
        navigator.permissions.query({ name: "clipboard-read" }).then(result => {
            if (result.state === "granted" || result.state === "prompt") {
                navigator.clipboard.read().then(dlipboardItems => {
                    dlipboardItems.forEach(item => uploadBlobImage(item, setUploadfile, setContent))
                });
            }
        });
    }

    const { getRootProps } = useDropzone({ onDrop: onDropFile });
    return { uploadFile, setUploadfile, getRootProps, onPasteImageUpload }
}
const convertMarkdownUploadFileUrl = e => {
    const ext = e.fileName.substring(e.fileName.lastIndexOf('.') + 1)

    const img_exts = { ext: ['jpg', 'jpeg', 'png'], icon: "" };
    const txt_exts = { ext: ['txt'], icon: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/icon_text_file_48.png" };
    const pdf_exts = { ext: ['pdf'], icon: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/icon_pdf_48.png" };
    const excel_exts = { ext: ['xlsx', 'xls'], icon: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/icon_xlsx_48.png" };
    const mp3_exts = { ext: ['mp3'], icon: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/icon_music_48.png" };
    const zip_exts = { ext: ['zip'], icon: "https://s3-ap-northeast-1.amazonaws.com/mable.bucket/icon_zip_file_48.png" };

    console.log(e.fileName)
    console.log(ext)
    if (img_exts.ext.includes(ext)) {
        const imageUrl = `![${e.fileName}](${e.fileUrl} "${e.fileName}")`
        return imageUrl
    } else {
        const targetExt = [txt_exts, pdf_exts, excel_exts, mp3_exts, zip_exts].find(e => e.ext.includes(ext))
        return `[![${e.fileName}](${targetExt.icon})](${e.fileUrl})\n\n*${e.fileName}*`
    }
}
const uploadBlobImage = async (e, setUploadfile, setContent) => {
    const imageType = e.types.find(t => t === "image/png")
    if (!imageType) return

    const imageBlob = await e.getType(imageType);
    let reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onload = function () {
        const token = loadJson(`token`)
        const method = "POST";
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-jwt-token': token
        };
        const ext = imageType.substring(imageType.lastIndexOf('/') + 1)
        const obj = { fileName: "PasteFile_" + uuid() + "." + ext, base64Url: reader.result };
        const body = JSON.stringify(obj);
        fetch(fileUploadApiUrl, { method, headers, body })
            .then(res => res.json())
            .then(e => {
                console.log('Upload success: ')
                setUploadfile(prevFile => [...prevFile, e])
                setContent(content => content + convertMarkdownUploadFileUrl(e))
            }).catch()
    }
}
export default useUpload