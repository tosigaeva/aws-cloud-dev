import * as path from 'node:path';
import {
  ArnFormat,
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

type DeployTarget = 's3-only' | 'cloudfront';

interface SpaHostingStackProps extends StackProps {
  deployTarget: string;
  buildDir: string;
  s3StackName: string;
}

export class SpaHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: SpaHostingStackProps) {
    super(scope, id, props);

    const deployTarget = this.parseDeployTarget(props.deployTarget);
    if (deployTarget === 's3-only') {
      const sourcePath = path.resolve(process.cwd(), props.buildDir);
      const privateBucket = new s3.Bucket(this, 'SiteBucket', {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      new s3deploy.BucketDeployment(this, 'DeployWebsite', {
        destinationBucket: privateBucket,
        sources: [s3deploy.Source.asset(sourcePath)],
      });

      new CfnOutput(this, 'S3BucketName', {
        value: privateBucket.bucketName,
        exportName: this.exportNameFor(props.s3StackName, 'BucketName'),
      });

      new CfnOutput(this, 'S3RestUrl', {
        value: `https://${privateBucket.bucketRegionalDomainName}`,
        exportName: this.exportNameFor(props.s3StackName, 'RestUrl'),
      });

      return;
    }

    const bucketName = Fn.importValue(this.exportNameFor(props.s3StackName, 'BucketName'));
    const existingBucket = s3.Bucket.fromBucketName(this, 'SiteBucket', bucketName);

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(existingBucket),
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

    new s3.CfnBucketPolicy(this, 'SiteBucketPolicy', {
      bucket: bucketName,
      policyDocument: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            sid: 'AllowCloudFrontReadAccess',
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
            actions: ['s3:GetObject'],
            resources: [existingBucket.arnForObjects('*')],
            conditions: {
              StringEquals: {
                'AWS:SourceArn': this.formatArn({
                  service: 'cloudfront',
                  region: '',
                  account: this.account,
                  resource: 'distribution',
                  resourceName: distribution.distributionId,
                  arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
                }),
              },
            },
          }),
        ],
      }),
    });

    new CfnOutput(this, 'S3BucketName', {
      value: bucketName,
    });

    new CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
    });

    new CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });

    // Force a CloudFront invalidation on each deploy without re-uploading assets.
    new s3deploy.BucketDeployment(this, 'InvalidateDistribution', {
      destinationBucket: existingBucket,
      destinationKeyPrefix: '.cloudfront-control',
      distribution,
      distributionPaths: ['/*'],
      prune: false,
      sources: [s3deploy.Source.data('cdk-invalidation.txt', `invalidate:${new Date().toISOString()}`)],
    });
  }

  private parseDeployTarget(value: string): DeployTarget {
    if (value === 's3-only' || value === 'cloudfront') {
      return value;
    }

    throw new Error('Invalid deployTarget. Use "s3-only" or "cloudfront".');
  }

  private exportNameFor(stackName: string, suffix: string): string {
    return `${stackName}-${suffix}`;
  }
}
