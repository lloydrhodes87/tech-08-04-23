import { aws_lambda, aws_lambda_nodejs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getResourceName } from '../helpers/getResourceName';
import { KrakenStackProps } from '../kraken-stack-props';

export const createDlqHandler = (
	scope: Construct,
	props: KrakenStackProps,
): aws_lambda_nodejs.NodejsFunction => {
	return new aws_lambda_nodejs.NodejsFunction(scope, 'CreateDLQHandler', {
		functionName: getResourceName(props, 'dlq-handler'),
		runtime: aws_lambda.Runtime.NODEJS_16_X,
		entry: 'src/handlers/sendToDlq/sendToDlqHandler.ts',
		handler: 'handler',
		bundling: {
			minify: true,
			keepNames: true,
			sourceMap: true,
		},
	});
};
