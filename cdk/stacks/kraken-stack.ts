import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createKrakenApi } from '../constructs/createApiGateway';
import { createDlqHandler } from '../constructs/createDlqHandler';
import { createOutageHandler } from '../constructs/createPostOutageHandler';
import { createStepFunction } from '../constructs/createStepFunction';
import { createStepFunctionApiIntegration } from '../constructs/createStepFunctionApiIntegration';
import { KrakenStackProps } from '../kraken-stack-props';

export class KrakenStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: KrakenStackProps) {
		super(scope, id, props);

		const outageHandler = createOutageHandler(this, props);
		const dlqHandler = createDlqHandler(this, props);
		const stepFunction = createStepFunction(
			this,
			props,
			outageHandler,
			dlqHandler,
		);

		const stepFunctionIntegration = createStepFunctionApiIntegration(
			this,
			stepFunction.stateMachineArn,
		);
		const api = createKrakenApi(this, props, stepFunctionIntegration);

		new CfnOutput(this, 'ApiEndpoint', {
			value: api.url,
		});

		new CfnOutput(this, 'ApiId', {
			value: api.restApiId,
		});
	}
}
