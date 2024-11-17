import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PreviewProps {
  content: string
}

export function Preview({ content }: PreviewProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}