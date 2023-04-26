import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {FrontendResources} from "./resources/frontend-resources";

export class AwsCdkToDoAppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new FrontendResources(this);
    }
}
