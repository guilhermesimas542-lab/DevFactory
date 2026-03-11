import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface PRDViewerProps {
  content: string;
  fileName?: string;
  onClose?: () => void;
}

export default function PRDViewer({ content, fileName, onClose }: PRDViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for environments without clipboard API
    }
  };

  const isModal = typeof onClose === 'function';

  const inner = (
    <div className="flex flex-col w-full h-full bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-shrink-0">
        <span className="text-sm font-semibold text-gray-700 truncate">
          {fileName ?? 'PRD'}
        </span>
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            title="Copiar conteúdo"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-md hover:bg-gray-200"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-600">Copiado</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                <span>Copiar</span>
              </>
            )}
          </button>

          {/* Close button — only in modal mode */}
          {isModal && (
            <button
              onClick={onClose}
              title="Fechar"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Fechar</span>
            </button>
          )}
        </div>
      </div>

      {/* Markdown body */}
      <div
        className={
          isModal
            ? 'flex-1 overflow-y-auto px-6 py-5'
            : 'overflow-y-auto max-h-[600px] px-6 py-5'
        }
      >
        <div className="prose prose-sm max-w-none text-gray-800
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
          prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
          prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
          prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:text-gray-600
          prose-table:text-sm prose-th:bg-gray-100 prose-th:text-gray-700
          prose-hr:border-gray-200
          prose-li:marker:text-gray-400"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-xl shadow-2xl">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {inner}
    </div>
  );
}
