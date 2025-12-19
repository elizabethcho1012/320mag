#!/usr/bin/env tsx
// 키워드 추출 로직 테스트

function extractKeySubject(title: string): string | null {
  const excludeWords = new Set([
    'The', 'What', 'Does', 'It', 'Really', 'Take', 'Get', 'Ask',
    'Red', 'Carpet', 'Festival', 'Awards', 'Show', 'Event',
    'Magazine', 'Collection', 'Biggest', 'Trends', 'Signal',
    'Vibe', 'Shift', 'Makeup', 'Best', 'Top', 'New', 'Latest',
    'Behind', 'Scenes', 'Inside', 'How', 'Why', 'When', 'Where',
    'Beauty', 'Fashion', 'Style', 'Dress', 'Look'
  ]);

  const namePattern = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+(?:-[A-Z][a-z]+)?){1,2})\b/g;
  const matches = title.match(namePattern);

  console.log(`  매치들: ${matches ? matches.join(', ') : '없음'}`);

  if (matches) {
    for (const name of matches) {
      const words = name.split(/[\s-]+/);
      const isValidName = words.every(word => !excludeWords.has(word));

      console.log(`    "${name}" - 단어: [${words.join(', ')}] - 유효: ${isValidName}`);

      if (isValidName && words.length >= 2) {
        return name;
      }
    }
  }

  return null;
}

// 테스트
const testTitles = [
  "What Does It Really Take to Get a Dress on the Red Carpet? Ask Jenny Packham",
  "Anya Taylor-Joy Closes Her Marrakech Film Festival Run",
  "The Biggest Makeup Trends of 2026 Signal a Colorful Vibe Shift"
];

console.log('🧪 키워드 추출 테스트\n');

testTitles.forEach(title => {
  console.log(`제목: "${title}"`);
  const result = extractKeySubject(title);
  console.log(`✅ 추출 결과: ${result || '없음'}\n`);
});
