import { getParsedStacks, loadCdkDiffLog, saveCdkDiffLog } from './parsingLogic';

export function run() {
  const cliArgs = process.argv.slice(2);
  if (cliArgs.length !== 1) {
    console.error('Please provide a path to the CDK diff log file');
    return;
  }
  const filePath = cliArgs[0];

  const cdkDiffLogContent = loadCdkDiffLog(filePath);

  const newStacks = getParsedStacks(cdkDiffLogContent);

  saveCdkDiffLog(filePath, newStacks);

  if (newStacks.match(new RegExp('\\[\\+\\]|\\[\\-\\]', 'gm'))) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
