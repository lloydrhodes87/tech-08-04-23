import { aws_sqs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getResourceName } from '../helpers/getResourceName';
import { KrakenStackProps } from '../kraken-stack-props';

export const createDlq = (scope: Construct, props: KrakenStackProps) => {
	return new aws_sqs.Queue(scope, 'KrakenDlq', {
		queueName: getResourceName(props, 'kraken-failure-queue'),
	});
};
