#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { SpaHostingStack } from '../lib/spa-hosting-stack';

const app = new cdk.App();

const account = process.env.AWS_ACCOUNT_ID ?? process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.AWS_REGION ?? process.env.CDK_DEFAULT_REGION;

if (!account || !region) {
  throw new Error(
    'AWS account and region are required. Set AWS_ACCOUNT_ID and AWS_REGION in .env or configure the AWS CLI/CDK environment.',
  );
}

const deployTarget = app.node.tryGetContext('deployTarget') ?? 'cloudfront';
const buildDir = process.env.BUILD_DIR ?? 'dist';
const stackName = process.env.STACK_NAME ?? 'RsShopSpaStack';

new SpaHostingStack(app, stackName, {
  env: { account, region },
  deployTarget,
  buildDir,
});
