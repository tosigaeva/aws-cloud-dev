# Task 2: Serve SPA in AWS S3 and CloudFront

This repository now contains a reusable AWS CDK setup for hosting a Single Page Application in AWS.

Important constraint: the assignment must be completed in your own fork of `nodejs-aws-shop-react`. This repository is not that fork, so treat the files here as deployment scaffolding and task notes unless you copy them into your React Shop repository.

## What Is Included

- AWS CDK stack for `s3-only` deployment
- AWS CDK stack for `cloudfront` deployment
- automatic S3 upload through `BucketDeployment`
- automatic CloudFront invalidation in the final deployment mode
- npm scripts for build, deploy, and destroy

## Prerequisites

Install and configure:

- Node.js and npm
- AWS CLI
- AWS CDK v2

Commands:

```bash
npm install -g aws-cdk
aws configure
```

You can also provide credentials through `.env`.

## Environment Variables

Copy [.env.example](./.env.example) to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required values:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_ACCOUNT_ID`

Useful optional values:

- `APP_DIR` - path to the React app, default: `.`
- `BUILD_DIR` - build output folder, default: `dist`
- `STACK_NAME` - CDK stack name, default: `RsShopSpaStack`

If you move this setup into your React Shop fork, leave `APP_DIR=.`.

## Installation

Install project dependencies:

```bash
npm install
```

## Available Scripts

Defined in [package.json](./package.json):

- `npm run build:app`
- `npm run cdk:synth`
- `npm run deploy:s3-only`
- `npm run deploy:cloudfront`
- `npm run destroy:s3-only`
- `npm run destroy:cloudfront`

## Deployment Modes

### `s3-only`

Use this mode for Task 2.2 step 1.

It creates:

- a public S3 bucket
- S3 static website hosting
- deployment of your built SPA into the bucket

Output:

- S3 bucket name
- S3 website URL

### `cloudfront`

Use this mode for the final automated deployment.

It creates:

- a private S3 bucket
- a CloudFront distribution
- SPA-friendly routing for `403` and `404`
- deployment of your built SPA into the bucket
- automatic CloudFront invalidation on deployment

Output:

- S3 bucket name
- CloudFront URL

## Manual Deployment Checklist

This covers Task 2.1 in the AWS Console.

1. Create an S3 bucket with static website hosting enabled.
2. Set `index.html` as index document.
3. Set `index.html` as error document for SPA routing.
4. Upload the built app manually.
5. Verify the S3 website URL works.
6. Create a CloudFront distribution pointing to the bucket.
7. Verify the CloudFront URL works.
8. Change the app, rebuild, upload again, and create an invalidation.

## Automated Deployment Steps

### 1. Work in your forked React Shop repository

The submitted solution should live in your fork of:

- [nodejs-aws-shop-react](https://github.com/rolling-scopes-school/nodejs-aws-shop-react)

Recommended approach:

1. Fork the repository.
2. Clone your fork.
3. Copy the CDK files from this repository into that fork.
4. Install dependencies there.
5. Run the scripts from the React Shop root.

### 2. Build and deploy S3 website hosting

```bash
npm run deploy:s3-only
```

This script:

- runs the app build
- creates the S3 bucket
- uploads the static files

### 3. Destroy the temporary S3-only infrastructure

```bash
npm run destroy:s3-only
```

### 4. Build and deploy final CloudFront setup

```bash
npm run deploy:cloudfront
```

This script:

- runs the app build
- creates the private S3 bucket
- creates the CloudFront distribution
- uploads the static files
- invalidates CloudFront cache automatically

### 5. Destroy final infrastructure when finished

```bash
npm run destroy:cloudfront
```

## Files

- [bin/spa-hosting.ts](./bin/spa-hosting.ts): CDK entry point
- [lib/spa-hosting-stack.ts](./lib/spa-hosting-stack.ts): stack with both deployment modes
- [scripts/build-app.mjs](./scripts/build-app.mjs): wrapper that runs the SPA build before deploy

## Required README Links

Replace these placeholders after you complete the task in your real React Shop fork:

- S3 website URL: `http://<your-bucket-name>.s3-website-<region>.amazonaws.com`
- CloudFront URL: `https://<your-distribution-domain>`

If your final setup uses a private S3 bucket behind CloudFront, the S3 website URL from the final setup may return `403 Access Denied`. That is expected for the final secure configuration. Keep the manual deployment link from Task 2.1 if your reviewer expects both links.

## Pull Request Description Template

Use this in your PR description:

```md
## What has been done

- [x] Manual S3 deployment completed
- [x] CloudFront distribution created
- [x] AWS CDK deployment added
- [x] Automatic invalidation configured

## Links

- S3 website: http://<your-bucket-name>.s3-website-<region>.amazonaws.com
- CloudFront: https://<your-distribution-domain>
```

## Notes

- The `cloudfront` mode uses a private S3 bucket, which matches the final evaluation requirement where the CloudFront URL works and direct bucket access is not public.
- The stack uses `BucketDeployment`, so invalidation is handled automatically in the final mode.
- `autoDeleteObjects` and `RemovalPolicy.DESTROY` are enabled to make cleanup easier for learning environments.
