import * as cdk from 'aws-cdk-lib';
import { AppStack } from './../lib/app-stack';

const app = new cdk.App();
const env = { account: '381491975528', region: 'us-east-1' };

// deploy a production ready elevate labs application environment

new AppStack(app, 'AppStack', {
  env,
  stage: 'production',
  stackName: 'ElevateLabsAppProductionStack'
});

// deploy a staging ready elevate labs application environment

// new AppStack(app, 'AppStack', {
//   env,
//   stage: 'staging',
//   stackName: 'ElevateLabsAppStagingStack'
// });

// deploy a qa ready elevate labs application environment

// new AppStack(app, 'AppStack', {
//   env,
//   stage: 'qa',
//   stackName: 'ElevateLabsAppQaStack'
// });

app.synth();
