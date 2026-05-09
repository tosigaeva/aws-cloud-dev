# Task 2: Serve SPA in AWS S3 and CloudFront

This repository contains the React Shop SPA together with AWS CDK configuration for Task 2.

## What Was Done

- added AWS CDK configuration for private SPA asset hosting
- added automated deployment to S3
- added automated deployment to CloudFront
- configured SPA fallback to `index.html`
- added deployment and destroy npm scripts

## Tech Stack

- Vite
- React
- TypeScript
- Material UI
- AWS CDK
- Amazon S3
- Amazon CloudFront

## Prerequisites

- Node.js 20
- npm
- AWS CLI
- AWS CDK v2

Recommended:

```bash
nvm use
```

If Node 20 is not installed:

```bash
nvm install 20
nvm use 20
```

Install AWS CDK globally if needed:

```bash
npm install -g aws-cdk
```

## Environment Setup

Create `.env` based on `.env.example` and fill in:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `APP_DIR=.`
- `BUILD_DIR=dist`
- `STACK_NAME_S3=RsShopSpaS3Stack`
- `STACK_NAME_CLOUDFRONT=RsShopSpaCloudFrontStack`

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run start
```

## Available Scripts

- `npm run start`
- `npm run build`
- `npm run deploy:s3-only`
- `npm run deploy:cloudfront`
- `npm run outputs:s3-only`
- `npm run outputs:cloudfront`
- `npm run destroy:s3-only`
- `npm run destroy:cloudfront`
- `npm run cdk:synth`

## AWS Bootstrap

Before the first CDK deployment:

```bash
npx cdk bootstrap
```

## Manual Deployment

### S3 Website Hosting

1. Create an S3 bucket.
2. Keep the bucket private.
3. Build the app.
4. Upload the `dist` files manually to the bucket.
5. Verify objects are present in the bucket.

### CloudFront

1. Create a CloudFront distribution for the S3 bucket.
2. Verify CloudFront can serve the app.
3. Make a visible app change.
4. Rebuild and upload again.
5. Create a CloudFront invalidation.

## Automated Deployment

### Deploy S3 Website Hosting

```bash
npm run deploy:s3-only
```

This creates:

- private S3 bucket
- deployment of built SPA files
- stable S3-only URLs on repeated deploys because this mode uses its own stack

This command is responsible for content deployment:

- build the app
- create the S3 stack if it does not exist
- upload the latest `dist` files to the bucket
- keep direct S3 access private

### Destroy S3 Website Hosting

```bash
npm run destroy:s3-only
```

### Deploy Final CloudFront Setup

```bash
npm run deploy:cloudfront
```

This creates:

- CloudFront distribution for the existing S3 bucket
- automatic CloudFront invalidation
- stable CloudFront URL on repeated deploys because this mode uses its own stack

This command is responsible for CDN deployment:

- it expects the S3 stack to already exist
- it creates the CloudFront stack if it does not exist
- it invalidates CloudFront cache on repeated deploys
- it does not rebuild or re-upload frontend assets

### Destroy Final CloudFront Setup

```bash
npm run destroy:cloudfront
```

## Deployment Notes

- `s3-only` is the private asset bucket stack and uses a separate stack from the CDN setup
- `cloudfront` depends on the existing S3 stack and should be treated as the long-lived CDN stack
- CloudFront is configured to return `index.html` for `403` and `404` so SPA routes work correctly
- direct S3 access should be blocked; the CloudFront URL is the public entry point for the app
- the normal update flow is:
  1. `npm run deploy:s3-only`
  2. `npm run deploy:cloudfront`
- use `npm run outputs:cloudfront` or `npm run outputs:s3-only` to get the current URLs without redeploying

## Required Links

- S3 bucket URL: `https://rsshopspas3stack-sitebucket397a1860-wsqlo4doxyui.s3.eu-central-1.amazonaws.com/`
- CloudFront URL: `https://d2vep3q9mtqlfa.cloudfront.net/`

## Pull Request Description

Example:

```md
## What has been done

- [x] S3 bucket created and configured
- [x] App deployed to private S3 bucket
- [x] CloudFront distribution created
- [x] AWS CDK deployment added
- [x] Automatic CloudFront invalidation configured

## Links

- S3 bucket: https://<your-bucket-name>.s3.<region>.amazonaws.com
- CloudFront: https://<your-distribution-domain>
```
