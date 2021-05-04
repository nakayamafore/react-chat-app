import React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = {
    code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        return match
            ? <SyntaxHighlighter language={match[1]} PreTag="div" style={tomorrow} >{children[0].replace(/\n$/i, "")}</SyntaxHighlighter>
            : <code className={className} children={children} {...props} />
    }
}
export default CodeBlock