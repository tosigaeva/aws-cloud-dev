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
const s3StackName = process.env.STACK_NAME_S3 ?? process.env.STACK_NAME ?? 'RsShopSpaS3Stack';
const defaultStackName =
  deployTarget === 's3-only' ? 'RsShopSpaS3Stack' : 'RsShopSpaCloudFrontStack';
const stackName =
  deployTarget === 's3-only'
    ? process.env.STACK_NAME_S3 ?? process.env.STACK_NAME ?? defaultStackName
    : process.env.STACK_NAME_CLOUDFRONT ?? process.env.STACK_NAME ?? defaultStackName;

new SpaHostingStack(app, stackName, {
  env: { account, region },
  deployTarget,
  buildDir,
  s3StackName,
});
