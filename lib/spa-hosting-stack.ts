import * as path from 'node:path';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

type DeployTarget = 's3-only' | 'cloudfront';

interface SpaHostingStackProps extends StackProps {
  deployTarget: string;
  buildDir: string;
}

export class SpaHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: SpaHostingStackProps) {
    super(scope, id, props);

    const deployTarget = this.parseDeployTarget(props.deployTarget);
    const sourcePath = path.resolve(process.cwd(), props.buildDir);

    if (deployTarget === 's3-only') {
      const publicBucket = new s3.Bucket(this, 'SiteBucket', {
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
        publicReadAccess: true,
        blockPublicAccess: new s3.BlockPublicAccess({
          blockPublicAcls: false,
          blockPublicPolicy: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        }),
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      new s3deploy.BucketDeployment(this, 'DeployWebsite', {
        destinationBucket: publicBucket,
        sources: [s3deploy.Source.asset(sourcePath)],
      });

      new CfnOutput(this, 'S3BucketName', {
        value: publicBucket.bucketName,
      });

      new CfnOutput(this, 'S3WebsiteUrl', {
        value: publicBucket.bucketWebsiteUrl,
      });

      return;
    }

    const privateBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(privateBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(1),
        },
      ],
    });

    new s3deploy.BucketDeployment(this, 'DeployDistribution', {
      destinationBucket: privateBucket,
      distribution,
      distributionPaths: ['/*'],
      sources: [s3deploy.Source.asset(sourcePath)],
    });

    new CfnOutput(this, 'S3BucketName', {
      value: privateBucket.bucketName,
    });

    new CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
  }

  private parseDeployTarget(value: string): DeployTarget {
    if (value === 's3-only' || value === 'cloudfront') {
      return value;
    }

    throw new Error('Invalid deployTarget. Use "s3-only" or "cloudfront".');
  }
}
