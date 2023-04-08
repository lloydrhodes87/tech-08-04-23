import { App, assertions, aws_lambda, aws_logs } from 'aws-cdk-lib';
import { getResourceName } from '../helpers/getResourceName';
import { KrakenStackProps } from '../kraken-stack-props';
import { KrakenFlexStack } from './krakenflex-stack';

const { Template, Capture } = assertions;

let stackProps: KrakenStackProps;

describe('main-stack', () => {
	let stack: KrakenFlexStack;
	let template: assertions.Template;

	beforeAll(() => {
		const app = new App();

		stackProps = {
			componentId: 'test-component',
		};

		stack = new KrakenFlexStack(app, 'MyTestKrakenStack', stackProps);
		template = Template.fromStack(stack);
	});

	describe('Api gateway', () => {
		it('should create an api ', () => {
			const apiRef = new Capture();

			Template.fromStack(stack).resourceCountIs(
				'AWS::ApiGateway::Resource',
				1,
			);

			Template.fromStack(stack).hasResourceProperties(
				'AWS::ApiGateway::Resource',
				{
					PathPart: 'outages',
					RestApiId: {
						Ref: apiRef,
					},
				},
			);
			expect(apiRef.asString()).toMatch(/^KrakenApi/);
		});

		it('should add api models to the lender gateway', () => {
			template.resourceCountIs('AWS::ApiGateway::Model', 2);

			template.hasResourceProperties('AWS::ApiGateway::Model', {
				ContentType: 'application/json',
				Name: 'OutageRequestModel',
				Schema: {
					title: 'Outages Request',
					type: 'object',
					additionalProperties: false,
					required: ['siteId', 'forceError'],
					properties: {
						siteId: {
							type: 'string',
							description: 'The site id for outages',
							default: 'pear-tree',
						},
						forceError: {
							type: 'boolean',
							description:
								'An error can be forced to look at error flow.',
							default: false,
						},
					},
				},
			});
			template.hasResourceProperties('AWS::ApiGateway::Model', {
				ContentType: 'application/json',
				Name: 'OutageResponseModel',
				Schema: {
					title: 'Outages Response',
					type: 'object',
					additionalProperties: false,
					required: ['statusCode', 'message', 'outages'],
					properties: {
						statusCode: {
							type: 'number',
							description: 'Status Code',
							default: 200,
						},
						message: {
							type: 'string',
							description: 'the response message',
						},
						outages: {
							type: 'array',
							items: {
								properties: {
									id: {
										type: 'string',
										description: 'id of the outage',
									},
									begin: {
										type: 'string',
										description: 'start date of outage',
									},
									end: {
										type: 'string',
										description: 'end date of outage',
									},
									name: {
										type: 'string',
										description: 'Name of the outage',
									},
								},
							},
						},
					},
				},
			});
		});
	});

	describe('state machine', () => {
		it('should create an express state machine', () => {
			Template.fromStack(stack).hasResourceProperties(
				'AWS::StepFunctions::StateMachine',
				{
					StateMachineName: getResourceName(
						stackProps,
						'state-machine',
					),
					StateMachineType: 'EXPRESS',
				},
			);
		});
	});

	describe('step function integration', () => {
		it('should create an apigateway step function integration', () => {
			const stateMachine = Template.fromStack(stack).findResources(
				'AWS::StepFunctions::StateMachine',
				{
					Properties: {
						StateMachineName: getResourceName(
							stackProps,
							'state-machine',
						),
					},
				},
			);

			const stateMachineRef = Object.keys(stateMachine)[0];

			Template.fromStack(stack).hasResourceProperties(
				'AWS::ApiGateway::Method',
				{
					HttpMethod: 'POST',
					Integration: {
						RequestTemplates: {
							'application/json': {
								['Fn::Join']: [
									'',
									[
										'{\n"stateMachineArn": "',
										{
											Ref: stateMachineRef,
										},
										'",\n"input": "$util.escapeJavaScript($input.json(\'$\'))"\n}\n                ',
									],
								],
							},
						},
					},
				},
			);

			expect(stateMachineRef).toMatch(/^KrakenStateMachine/);
		});
	});

	describe('lambdas', () => {
		it('should create an outage handler function', () => {
			Template.fromStack(stack).hasResourceProperties(
				'AWS::Lambda::Function',
				{
					FunctionName: 'test-component-outage-handler',
				},
			);
		});

		it('should create a dlq handler function', () => {
			Template.fromStack(stack).hasResourceProperties(
				'AWS::Lambda::Function',
				{
					FunctionName: 'test-component-dlq-handler',
				},
			);
		});

		it('should create a policy to allow send to SQS', () => {
			const arnRef = new Capture();
			Template.fromStack(stack).hasResourceProperties(
				'AWS::IAM::Policy',
				{
					PolicyDocument: {
						Statement: [
							{
								Action: 'sqs:SendMessage',
								Effect: 'Allow',
								Resource: {
									'Fn::GetAtt': [arnRef, 'Arn'],
								},
							},
						],
						Version: '2012-10-17',
					},
					PolicyName:
						'CreateDLQHandlerServiceRoleDefaultPolicyDA2C61F4',
					Roles: [
						{
							Ref: 'CreateDLQHandlerServiceRole5DAED0B4',
						},
					],
				},
			);

			expect(arnRef.asString()).toMatch(/^KrakenDlq/);
		});
	});

	describe('Queue', () => {
		it('should create a queue', () => {
			const queueNameRef = new Capture();
			Template.fromStack(stack).hasResourceProperties('AWS::SQS::Queue', {
				QueueName: queueNameRef,
			});

			expect(queueNameRef.asString()).toMatch(
				/test-component-kraken-failure-queue/,
			);
		});
	});
});
