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
      '\\[~] Custom::AWS.*\\n.*Create.*\\n.*getParameter(.*)region.*\\n.*getParameter(\\1)region.*\\n.*Update.*\\n.*getParameter(\\1).*\\n.*getParameter(\\1).*',
      'gm',
    ),
    '',
  ],
];
const STACK_TAGS_REMOVAL_REGEX: [RegExp, string][] = [
  [new RegExp('.*\\[~] Tags([\\s\\S]*?)(?=\\[~] AWS|\n\n)', 'gm'), ' └─ [~] Tags ...truncated\n'],
];

function cleanCdkDiffLog(cdkLog: string) {
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

    if (!cleanStackDetails.includes('There were no differences')) {
      const cleanStackVersionTags = cleanCDKTagsDiffForSingleStack(cleanStackDetails);
      cdkLogParts.push(stackName);
      if (!cleanStackVersionTags.includes('There were no tags differences')) {
        cdkLogParts.push(`${cleanStackVersionTags}Review cdk-diff job logs for full tags diff output !!!\n`);
      } else {
        cdkLogParts.push(`${cleanStackDetails}\n`);
      }
    }
  }
  return cdkLogParts.join('\n');
}

function separateDiffLogIntoStacks(log: string) {
  const stacks = log.split(new RegExp('(^Stack )', 'gm'));
  if (stacks[0] === '' || !stacks[0].startsWith('Stack')) stacks.shift();
  return stacks.map((_, i) => (i % 2 === 0 ? '' : stacks[i - 1] + stacks[i])).filter((e) => e);
}

function cleanCDKTagsDiffForSingleStack(log: string) {
  if (!log.match(new RegExp('.*\\[~] Tags([\\s\\S]*?)(?=\\[~] AWS|\n\n)', 'gm'))) {
    return 'There were no tags differences';
  }
  let cleanDiff = log;
  for (const [regex, replacer] of STACK_TAGS_REMOVAL_REGEX) {
    cleanDiff = cleanDiff.replace(regex, replacer);
  }
  return cleanDiff;
}

export function loadCdkDiffLog(filePath: string) {
  return fs.readFileSync(filePath, 'utf8');
}

export function saveCdkDiffLog(filePath: string, newStacks: string) {
  fs.writeFileSync(filePath, newStacks);
}

export function getParsedStacks(cdkDiffLogContent: string) {
  const cleanedCdkDiffLog = cleanCdkDiffLog(cdkDiffLogContent);
  const stacks = separateDiffLogIntoStacks(cleanedCdkDiffLog);
  return rebuildDiffsIntoCdkLog(stacks);
}
