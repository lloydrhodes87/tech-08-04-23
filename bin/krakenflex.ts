#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { KrakenStack } from '../cdk/stacks/kraken-stack';

const app = new cdk.App();

const componentProps = {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    componentId: 'kraken-tech-test'
}
new KrakenStack(app, 'KrakenStack', componentProps);