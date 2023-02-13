import { getParsedStacks, loadCdkDiffLog } from '../src/parsingLogic';

test('no-op', () => {});

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
});
