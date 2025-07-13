#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BadmintonClubStack } from '../lib/badminton-club-stack';

const app = new cdk.App();
new BadmintonClubStack(app, 'BadmintonClubStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || '762233758459',
        region: process.env.CDK_DEFAULT_REGION || 'ap-southeast-2',
    },
});