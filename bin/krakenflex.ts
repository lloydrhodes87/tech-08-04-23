#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { KrakenFlexStack } from '../cdk/stacks/krakenflex-stack';

const app = new cdk.App();

const componentProps = {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
	componentId: 'kraken-tech-test',
};
new KrakenFlexStack(app, 'KrakenFlexStack', componentProps);
