import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    // Parse markdown to HTML
    const rawHtml = marked.parse(content) as string;
    // Sanitize HTML to prevent XSS
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  return (
    <div
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};