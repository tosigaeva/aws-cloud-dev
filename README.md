# Task 2: Serve SPA in AWS S3 and CloudFront

This repository contains the React Shop SPA together with AWS CDK configuration for Task 2.

## What Was Done

- added AWS CDK configuration for static SPA hosting
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
- `STACK_NAME=RsShopSpaStack`

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
2. Enable static website hosting.
3. Set `index.html` as the index document.
4. Set `index.html` as the error document for SPA routing.
5. Build the app.
6. Upload the `dist` files manually to the bucket.
7. Verify the app is available via the S3 website endpoint.

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

- public S3 bucket
- static website hosting
- deployment of built SPA files

### Destroy S3 Website Hosting

```bash
npm run destroy:s3-only
```

### Deploy Final CloudFront Setup

```bash
npm run deploy:cloudfront
```

This creates:

- private S3 bucket
- CloudFront distribution
- automatic deployment of built SPA files
- automatic CloudFront invalidation

### Destroy Final CloudFront Setup

```bash
npm run destroy:cloudfront
```

## Deployment Notes

- `s3-only` is intended for the simpler website-hosting stage
- `cloudfront` is intended for the final secure setup
- CloudFront is configured to return `index.html` for `403` and `404` so SPA routes work correctly

## Required Links

Replace these placeholders after deployment:

- S3 website URL: `http://<your-bucket-name>.s3-website-<region>.amazonaws.com`
- CloudFront URL: `https://<your-distribution-domain>`

## Pull Request Description

Example:

```md
## What has been done

- [x] S3 bucket created and configured
- [x] App deployed to S3 website hosting
- [x] CloudFront distribution created
- [x] AWS CDK deployment added
- [x] Automatic CloudFront invalidation configured

## Links

- S3 website: http://<your-bucket-name>.s3-website-<region>.amazonaws.com
- CloudFront: https://<your-distribution-domain>
```
