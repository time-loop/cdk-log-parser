import { clickupTs } from '@time-loop/clickup-projen';
import { javascript } from 'projen';

const project = new clickupTs.ClickUpTypeScriptProject({
  name: '@time-loop/cdk-log-parser',
  defaultReleaseBranch: 'main',
  licensed: true,
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: '9',

  projenrcTs: true,
  bin: {
    'cdk-log-parser': 'src/cdkLogParser.ts',
  },
});

project.package.addField('files', ['/bin', '/lib', '/npm-shrinkwrap.json']);

project.synth();
