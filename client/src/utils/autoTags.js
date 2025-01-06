import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

// Предопределенные категории и ключевые слова
const CATEGORIES = {
  technology: ['javascript', 'react', 'vue', 'angular', 'node', 'python', 'java', 'database'],
  design: ['ui', 'ux', 'design', 'responsive', 'mobile', 'layout', 'typography'],
  development: ['api', 'rest', 'graphql', 'backend', 'frontend', 'testing', 'deployment'],
  seo: ['seo', 'optimization', 'meta', 'keywords', 'ranking', 'analytics'],
  marketing: ['marketing', 'social', 'campaign', 'strategy', 'branding', 'audience']
};

export const generateAutoTags = (title, content, maxTags = 5) => {
  // Объединяем текст для анализа
  const text = `${title} ${content}`.toLowerCase();
  
  // Токенизация и удаление стоп-слов
  const tokens = tokenizer.tokenize(text)
    .filter(token => token.length > 2)
    .filter(token => !natural.stopwords.includes(token));

  // Добавляем документ в TF-IDF
  tfidf.addDocument(tokens);

  // Получаем на��более важные термины
  const terms = [];
  tfidf.listTerms(0).forEach(item => {
    const term = item.term;
    
    // Проверяем, к какой категории относится термин
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.includes(term)) {
        terms.push({ term, category, score: item.tfidf });
        break;
      }
    }
  });

  // Сортируем по релевантности и выбираем топ теги
  return terms
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTags)
    .map(item => item.term);
}; 