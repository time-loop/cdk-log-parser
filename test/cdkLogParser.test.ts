import { getParsedStacks, loadCdkDiffLog } from '../src/parsingLogic';

test('no-op', () => {});

describe('getParsedStacks', () => {
  test('should remove all non-sense changes from a serivce instance diff log', () => {
    const cdkDiffLogContent = loadCdkDiffLog('test/data/serviceInstanceOutput.log');
    const parsedStacks = getParsedStacks(cdkDiffLogContent);
    expect(parsedStacks).toMatchSnapshot();
  });

  test('should remove all non-sense changes from a infra diff log', () => {
    const cdkDiffLogContent = loadCdkDiffLog('test/data/infraOutput.log');
    const parsedStacks = getParsedStacks(cdkDiffLogContent);
    expect(parsedStacks).toMatchSnapshot();
  });
});
