import { getParsedStacks, loadCdkDiffLog } from '../src/parsingLogic';

describe('getParsedStacks', () => {
  test('should remove all non-sense changes from a service instance diff log', () => {
    const cdkDiffLogContent = loadCdkDiffLog('test/data/serviceInstanceOutput.txt');
    const parsedStacks = getParsedStacks(cdkDiffLogContent);
    expect(parsedStacks).toMatchSnapshot();
  });

  test('should remove all non-sense changes from a infra diff log', () => {
    const cdkDiffLogContent = loadCdkDiffLog('test/data/infraOutput.txt');
    const parsedStacks = getParsedStacks(cdkDiffLogContent);
    expect(parsedStacks).toMatchSnapshot();
  });

  test('should ignore content before the first stack diff and NOT clobber the stack names', () => {
    const cdkDiffLogContent = loadCdkDiffLog('test/data/dontClobberStackName.txt');
    const parsedStacks = getParsedStacks(cdkDiffLogContent);
    expect(parsedStacks).toMatchSnapshot();
  });

  test('should NOT remove SSM diffs if the SSM name/path changes', () => {
    const cdkDiffLogContent = loadCdkDiffLog('test/data/changedSSM.txt');
    const parsedStacks = getParsedStacks(cdkDiffLogContent);
    expect(parsedStacks).toMatchSnapshot();
  });
});
