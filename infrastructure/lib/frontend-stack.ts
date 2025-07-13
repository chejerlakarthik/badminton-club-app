import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3StaticWebsiteOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class FrontendStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for frontend hosting
    this.bucket = new s3.Bucket(this, 'BadmintonClubAppFrontend', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'BadmintonClubAppDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3StaticWebsiteOrigin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // Deploy frontend build to S3 and invalidate CloudFront
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset('../../frontend/build')], // Change to '../frontend/dist' if needed
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.bucket.bucketName,
    });
    new cdk.CfnOutput(this, 'FrontendDistributionId', {
      value: this.distribution.distributionId,
    });
    new cdk.CfnOutput(this, 'FrontendDistributionDomainName', {
      value: this.distribution.domainName,
    });
  }
}

