import { aws_iam, aws_lambda, aws_lambda_nodejs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getResourceName } from '../helpers/getResourceName';
import { KrakenStackProps } from '../kraken-stack-props';

export const createOutageHandler = (
	scope: Construct,
	props: KrakenStackProps,
): aws_lambda_nodejs.NodejsFunction => {
	const outageHandler = new aws_lambda_nodejs.NodejsFunction(
		scope,
		'CreateOutage',
		{
			functionName: getResourceName(props, 'outage-handler'),
			runtime: aws_lambda.Runtime.NODEJS_16_X,
			entry: 'src/handlers/postOutage/postOutageHandler.ts',
			handler: 'handler',
			bundling: {
				minify: true,
				keepNames: true,
				sourceMap: true,
			},
		},
	);

	const getParamPolicy = new aws_iam.PolicyStatement({
		actions: ['ssm:GetParameter'],
		resources: [
			'arn:aws:ssm:eu-west-1:545127313298:parameter/kraken-api-key',
		],
	});

	outageHandler.addToRolePolicy(getParamPolicy);

	return outageHandler;
};
