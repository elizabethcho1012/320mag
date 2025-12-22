import * as fs from 'fs';
import * as readline from 'readline';

const file = process.env.HOME + '/.claude/projects/-Users-brandactivist-Desktop-320mag/ebe28c5f-dcff-4f9e-a0c6-b3a4279e006b.jsonl';

async function findMessage17() {
  const fileStream = fs.createReadStream(file);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let messageNumber = 0;
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    try {
      const msg = JSON.parse(line);
      const role = msg.message?.role || msg.role;

      // Count only user and assistant messages
      if (role === 'user' || role === 'assistant') {
        messageNumber++;

        const content = msg.message?.content || msg.content;

        if (Array.isArray(content)) {
          const contentLength = content.length;

          if (messageNumber === 17) {
            console.log(`\n=== MESSAGE #17 (Line ${lineNumber}) ===`);
            console.log(`Role: ${role}`);
            console.log(`Content items: ${contentLength}`);

            // Check each content item
            content.forEach((item: any, idx: number) => {
              if (item.type === 'image') {
                const hasData = item.source?.data && item.source.data.length > 0;
                console.log(`  [${idx}] IMAGE: ${hasData ? `has ${item.source.data.length} chars` : 'EMPTY!!!'}`);
              } else {
                console.log(`  [${idx}] ${item.type}`);
              }
            });
            break;
          }
        }
      }
    } catch (e) {
      // Skip invalid lines
    }
  }

  console.log(`\nTotal messages processed: ${messageNumber}`);
}

findMessage17().catch(console.error);
