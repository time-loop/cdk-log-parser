import fs from 'fs';

const LOG_REMOVAL_REGEX: [RegExp, string][] = [
  [new RegExp('^\\[Warning at.*\\n', 'gm'), ''],
  [new RegExp('^current credentials could not be used to assume.*\\n', 'gm'), ''],
  [new RegExp('^\\(To get rid of this warning.*\\n', 'gm'), ''],
];

const STACK_REMOVAL_REGEX: [RegExp, string][] = [
  [new RegExp('\\s(└─ \\[~\\] TemplateURL.*[\\s\\S]*?)(?:\\n\\n|\\||\\[ ] ])', ''), ''],
  [new RegExp('.*\\[-] Removed: \\.CDKMetadata\\n\\s', ''), ' '],
  [new RegExp('.*\\[~] .?Metadata:?[\\s\\S]*?└─ \\[\\+].*?(\\n\\s|$)', 'gm'), ' '],
  [new RegExp('^|.*\\n.*├─ \\[~] \\.Metadata:(\\n.*){3}\\n\\s', 'gm'), ''],
  [new RegExp('^(.*)(\\w{64})(\\.zip)\n', 'gm'), ''],
  [
    new RegExp(
      '\\[~] Custom::AWS.*\\n.*Create.*\\n.*getParameter.*\\n.*getParameter.*\\n.*Update.*\\n.*getParameter.*\\n.*getParameter.*',
      'gm',
    ),
    '',
  ],
];

function cleanCDKDiffLog(cdkLog: string) {
  let cleanLog = cdkLog;
  for (const [regex, replacer] of LOG_REMOVAL_REGEX) {
    cleanLog = cleanLog.replace(regex, replacer);
  }
  return cleanLog;
}

function cleanCDKDiffForSingleStack(stackDiff: string) {
  let cleanDiff = stackDiff;
  for (const [regex, replacer] of STACK_REMOVAL_REGEX) {
    cleanDiff = cleanDiff.replace(regex, replacer);
  }

  if (!cleanDiff.match(new RegExp('\\[\\+\\]|\\[\\-\\]', 'gm'))) {
    return 'There were no differences';
  }
  return cleanDiff;
}

function rebuildDiffsIntoCdkLog(stacks: string[]) {
  let cdkLogParts: string[] = [];
  for (const stack of stacks) {
    const stackName = stack.match(new RegExp('(^Stack .*)', 'gm'))?.[0] ?? '';
    const stackDetails = stack.replace(new RegExp('(^Stack .*)\n', 'gm'), '');
    const cleanStackDetails = cleanCDKDiffForSingleStack(stackDetails);
    cdkLogParts.push(stackName);
    cdkLogParts.push(`${cleanStackDetails}\n`);
  }
  return cdkLogParts.join('\n');
}

function separateDiffLogIntoStacks(log: string) {
  const stacks = log.split(new RegExp('(^Stack )', 'gm'));
  if (stacks[0] === '') stacks.shift();
  return stacks.map((_, i) => (i % 2 === 0 ? '' : stacks[i - 1] + stacks[i])).filter((e) => e);
}

function loadCdkDiffLog(filePath: string) {
  return fs.readFileSync(filePath, 'utf8');
}

function saveCdkDiffLog(filePath: string, newStacks: string) {
  fs.writeFileSync(filePath, newStacks);
}

export function run() {
  const cliArgs = process.argv.slice(2);
  if (cliArgs.length !== 1) {
    console.error('Please provide a path to the CDK diff log file');
    return;
  }
  const filePath = cliArgs[0];

  const cdkDiffLog = loadCdkDiffLog(filePath);
  const cleanCdkDiffLog = cleanCDKDiffLog(cdkDiffLog);
  const stacks = separateDiffLogIntoStacks(cleanCdkDiffLog);
  const newStacks = rebuildDiffsIntoCdkLog(stacks);
  saveCdkDiffLog(filePath, newStacks);

  if (newStacks.match(new RegExp('\\[\\+\\]|\\[\\-\\]', 'gm'))) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run();
