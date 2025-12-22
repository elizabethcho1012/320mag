import * as fs from 'fs';
import * as readline from 'readline';

const inputFile = process.env.HOME + '/.claude/projects/-Users-brandactivist-Desktop-320mag/ebe28c5f-dcff-4f9e-a0c6-b3a4279e006b.jsonl';
const outputFile = process.env.HOME + '/.claude/projects/-Users-brandactivist-Desktop-320mag/ebe28c5f-fixed.jsonl';

async function fixEmptyImages() {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const outputLines: string[] = [];
  let lineNumber = 0;
  let removedCount = 0;

  for await (const line of rl) {
    lineNumber++;
    try {
      const message = JSON.parse(line);

      // Check both message.content and message.message.content
      let content = message.content;
      if (message.message && Array.isArray(message.message.content)) {
        content = message.message.content;
      }

      // Check if content is array
      if (content && Array.isArray(content)) {
        // Filter out empty images
        const originalLength = content.length;
        const filteredContent = content.filter((item: any) => {
          if (item.type === 'image') {
            // Check if image source data is empty
            if (!item.source?.data || item.source.data === '' || item.source.data.length === 0) {
              console.log(`Line ${lineNumber}: Removing empty image (data length: ${item.source?.data?.length || 0})`);
              removedCount++;
              return false;
            }
          }
          return true;
        });

        // Update the correct location
        if (message.message && Array.isArray(message.message.content)) {
          message.message.content = filteredContent;
        } else {
          message.content = filteredContent;
        }

        if (filteredContent.length !== originalLength) {
          console.log(`Line ${lineNumber}: Removed ${originalLength - filteredContent.length} empty image(s)`);
        }
      }

      outputLines.push(JSON.stringify(message));
    } catch (e) {
      console.error(`Error parsing line ${lineNumber}:`, e);
      outputLines.push(line); // Keep original line if parse fails
    }
  }

  // Write to new file
  fs.writeFileSync(outputFile, outputLines.join('\n') + '\n');
  console.log(`\nProcessed ${lineNumber} lines`);
  console.log(`Removed ${removedCount} empty image(s)`);
  console.log(`Fixed file written to: ${outputFile}`);
  console.log(`\nTo apply the fix, run:`);
  console.log(`mv ${outputFile} ${inputFile}`);
}

fixEmptyImages().catch(console.error);
