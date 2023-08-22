import { clickupTs } from '@time-loop/clickup-projen';

const project = new clickupTs.ClickUpTypeScriptProject({
  name: '@time-loop/cdk-log-parser',
  defaultReleaseBranch: 'main',
  licensed: true,

  deps: ['aws-cdk-lib', 'aws-sdk'],
  devDeps: ['ts-node'],

  projenrcTs: true,
  bin: {
    'cdk-log-parser': 'src/cdkLogParser.ts',
  },
});

project.package.addField('files', ['/bin', '/lib', '/npm-shrinkwrap.json']);

project.synth();
