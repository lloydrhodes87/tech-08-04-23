import {
	aws_lambda,
	aws_logs,
	aws_stepfunctions,
	aws_stepfunctions_tasks,
	Duration,
	RemovalPolicy,
} from 'aws-cdk-lib';
import {
	FieldUtils,
	JsonPath,
	StateMachineType,
} from 'aws-cdk-lib/aws-stepfunctions';
import {
	LambdaInvoke,
	LambdaInvokeProps,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { getResourceName } from '../helpers/getResourceName';
import { KrakenStackProps } from '../kraken-stack-props';

export const createStepFunction = (
	scope: Construct,
	props: KrakenStackProps,
	postOutageHandler: aws_lambda.Function,
	dlqHandler: aws_lambda.Function,
) => {
	const stateMachineLogGroup = new aws_logs.LogGroup(
		scope,
		`${props.componentId}/StateMachineLogGroup`,
		{
			logGroupName: `/aws/vendedlogs/states/-${props.componentId}-state-machine`,
			retention: aws_logs.RetentionDays.ONE_DAY,
			removalPolicy: RemovalPolicy.DESTROY,
		},
	);

	const stateMachine = new aws_stepfunctions.StateMachine(
		scope,
		'StateMachine',
		{
			stateMachineName: getResourceName(props, 'state-machine'),
			definition: createStepFunctionDefinition(
				scope,
				postOutageHandler,
				dlqHandler,
			),
			timeout: Duration.minutes(5),
			stateMachineType: StateMachineType.EXPRESS,
			logs: {
				destination: stateMachineLogGroup,
				level: aws_stepfunctions.LogLevel.ALL,
				includeExecutionData: true,
			},
		},
	);
	return stateMachine;
};

const createStepFunctionDefinition = (
	scope: Construct,
	postOutageHandler: aws_lambda.Function,
	dlqHandler: aws_lambda.Function,
) => {
	const postOutagesTask = new aws_stepfunctions_tasks.LambdaInvoke(
		scope,
		'Post outage',
		{
			lambdaFunction: postOutageHandler,
			inputPath: '$',
			outputPath: '$.Payload',
		},
	);

	const sendErrorToDlq = new LambdaInvoke(scope, 'Handle DQL', {
		lambdaFunction: dlqHandler,
		inputPath: '$.Cause',
		resultPath: '$',
	});

	const errorTask = new aws_stepfunctions.Pass(scope, 'errorTask', {
		resultPath: '$',
	});

	const errorDefinition = sendErrorToDlq.next(errorTask);

	return postOutagesTask
		.addRetry({
			errors: ['States.ALL'],
			interval: Duration.seconds(1),
			maxAttempts: 1,
			backoffRate: 2,
		})
		.addCatch(errorDefinition);
};
