import { marked } from 'marked';
import { saveAs } from 'file-saver';

export const exportToMarkdown = (post) => {
  const markdown = `
# ${post.title}

${post.description}

${post.content}

Tags: ${post.tags.join(', ')}
  `.trim();

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${post.slug}.md`);
};

export const importFromMarkdown = async (file) => {
  const text = await file.text();
  const tokens = marked.lexer(text);
  
  return {
    title: tokens.find(t => t.type === 'heading')?.text || '',
    content: marked.parser(tokens),
    tags: []  // Извлекаем теги из текста
  };
}; 