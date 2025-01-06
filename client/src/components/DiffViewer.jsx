import { useMemo } from 'react';
import { diffWords } from 'diff';

const DiffViewer = ({ oldText, newText }) => {
  const diff = useMemo(() => diffWords(oldText || '', newText || ''), [oldText, newText]);

  return (
    <div className="font-mono text-sm whitespace-pre-wrap">
      {diff.map((part, index) => (
        <span
          key={index}
          className={`${
            part.added ? 'bg-green-100 text-green-800' :
            part.removed ? 'bg-red-100 text-red-800' :
            'text-gray-700'
          }`}
        >
          {part.value}
        </span>
      ))}
    </div>
  );
};

export default DiffViewer; 