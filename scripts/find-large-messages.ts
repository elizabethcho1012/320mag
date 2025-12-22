import * as fs from 'fs';
import * as readline from 'readline';

const file = process.argv[2] || process.env.HOME + '/.claude/projects/-Users-brandactivist-Desktop-320mag/e789e95d-b343-4f9d-bd99-f727124725b9.jsonl';

async function findLargeMessages() {
  const fileStream = fs.createReadStream(file);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  let foundEmpty = false;

  for await (const line of rl) {
    lineNumber++;
    try {
      const msg = JSON.parse(line);
      const content = msg.message?.content || msg.content;

      if (Array.isArray(content)) {
        const contentLength = content.length;

        // Check ALL messages for empty images
        content.forEach((item: any, idx: number) => {
          if (item.type === 'image') {
            const hasData = item.source?.data && item.source.data.length > 0;
            if (!hasData) {
              foundEmpty = true;
              console.log(`\nLine ${lineNumber}: EMPTY IMAGE at content index ${idx}`);
              console.log(`Role: ${msg.message?.role || msg.role}`);
              console.log(`Total content items: ${contentLength}`);
            }
          }
        });

        if (contentLength >= 50) {
          console.log(`\nLine ${lineNumber}: ${contentLength} content items (Role: ${msg.message?.role || msg.role})`);
        }
      }
    } catch (e) {
      // Skip invalid lines
    }
  }

  if (!foundEmpty) {
    console.log('\nNo messages with 50+ content items found, or no empty images');
  }

  console.log(`\nTotal lines processed: ${lineNumber}`);
}

findLargeMessages().catch(console.error);
