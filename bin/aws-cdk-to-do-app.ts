#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkToDoAppStack } from '../lib/aws-cdk-to-do-app-stack';

const app = new cdk.App();
new AwsCdkToDoAppStack(app, 'AwsCdkToDoAppStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});