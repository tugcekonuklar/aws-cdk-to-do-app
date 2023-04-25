import {Construct} from "constructs";
import {Bucket, BucketEncryption, IBucket} from "aws-cdk-lib/aws-s3";
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import {AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import {CnameRecord, IHostedZone, PublicHostedZone} from "aws-cdk-lib/aws-route53";
import {ICertificate} from "aws-cdk-lib/aws-certificatemanager";

export interface FrontendResources {
}

export class FrontendResources {
    private readonly scope: Construct;
    private readonly zoneName = 'aws-to-do.com';
    private readonly subDomain = 'my-app';
    private readonly domainName = `${this.subDomain}.${this.zoneName}`;
    private props?: FrontendResources | null;

    constructor(scope: Construct, props?: FrontendResources) {
        this.scope = scope;
        this.props = props ?? null;
        this.create();
    }

    private createS3Bucket(): IBucket {
        return new Bucket(this.scope, 'aws-todo-app-frontend-bucket', {
            bucketName: 'aws-todo-app-frontend-bucket-1234567875',
            encryption: BucketEncryption.S3_MANAGED,
            publicReadAccess: false
        })
    }

    private deployS3Bucket(s3Bucket: IBucket) {
        new BucketDeployment(this.scope, 'deploy-aws-todo-app-frontend', {
            sources: [Source.asset('./to-do-app')],
            destinationBucket: s3Bucket
        });
    }

    private createOriginAccess(s3Bucket: IBucket): S3Origin {
        const originAccess = new OriginAccessIdentity(this.scope, 'OriginAccessControl', {comment: 'AWS To-do App OAI'});
        return new S3Origin(s3Bucket, {originAccessIdentity: originAccess})
    }

    private createHostedZone(): IHostedZone {
        return new PublicHostedZone(this.scope, 'aws-to-do-app-hosted-zone', {
            zoneName: this.zoneName,
            comment: 'My AWS To-Do App hosted Zone'
        });
    }

    private createCfnDistribution(s3Origin: S3Origin, certificate?: ICertificate): Distribution {
        return new Distribution(this.scope, 'aws-to-do-app-cfn-distribution', {
            defaultBehavior: {
                origin: s3Origin,
                viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS
            },
            errorResponses: [
                {
                    httpStatus: 403,
                    responsePagePath: '/index.html',
                    responseHttpStatus: 200
                }
            ],
            domainNames: [`${this.domainName}`]
        })
    }

    private createCnameRecord(domainName: string, hostedZone: IHostedZone) {
        return new CnameRecord(this.scope, 'aws-to-do-app-cname-record', {
            recordName: `${this.subDomain}`,
            zone: hostedZone,
            domainName: domainName
        })
    }

    private create() {
        const s3Bucket = this.createS3Bucket();
        this.deployS3Bucket(s3Bucket);
        const s3Origin = this.createOriginAccess(s3Bucket);
        const hostedZone = this.createHostedZone();
        const distribution = this.createCfnDistribution(s3Origin);
        this.createCnameRecord(distribution.domainName, hostedZone);
    }
}