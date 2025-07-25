#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {FrontendStack} from "../lib/frontend-stack";
import {BackendStack} from "../lib/backend-stack";

const app = new cdk.App();

// Constants for AWS account ID and region
const AWS_ACCOUNT_ID = '762233758459';
const REGION_AP_SOUTHEAST_2 = 'ap-southeast-2';

new BackendStack(app, 'BackendStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || AWS_ACCOUNT_ID,
        region: process.env.CDK_DEFAULT_REGION || REGION_AP_SOUTHEAST_2,
    },
});

new FrontendStack(app, 'FrontendStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || AWS_ACCOUNT_ID,
        region: process.env.CDK_DEFAULT_REGION || REGION_AP_SOUTHEAST_2,
    }
});
