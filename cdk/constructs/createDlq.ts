import { aws_sqs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export const createDlq = (scope: Construct) => {
	return new aws_sqs.Queue(scope, 'KrakenDlq');
};
