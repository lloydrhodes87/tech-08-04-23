import { aws_apigateway, aws_logs, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { jsonMimeType, ResponseCodes } from '../constants';
import { getResourceName } from '../helpers/getResourceName';
import { KrakenStackProps } from '../kraken-stack-props';
import outagesRequest from '../';

export const createKrakenApi = (
	scope: Construct,
	props: KrakenStackProps,
	stepFunctionIntegration: aws_apigateway.AwsIntegration,
) => {
	const KrakenApiAccessLogs = new aws_logs.LogGroup(
		scope,
		'APIGatewayAccessLogs',
		{
			logGroupName: `/aws/api-gateway/${props.componentId}`,
			retention: aws_logs.RetentionDays.ONE_WEEK,
			removalPolicy: RemovalPolicy.DESTROY,
		},
	);

	const krakenApi = new aws_apigateway.RestApi(scope, 'KrakenApi', {
		restApiName: getResourceName(props, 'rest-api'),
		endpointTypes: [aws_apigateway.EndpointType.REGIONAL],
		deployOptions: {
			stageName: 'prod',
			accessLogDestination: new aws_apigateway.LogGroupLogDestination(
				KrakenApiAccessLogs,
			),
		},
	});

	const krakenResource = krakenApi.root.addResource('outages');

	const outageRequestModel = krakenApi.addModel('OutageRequestModel', {
		modelName: 'OutageRequestModel',
		contentType: jsonMimeType,
		schema: outagesRequest as aws_apigateway.JsonSchema,
	});

	krakenResource.addMethod('POST', stepFunctionIntegration, {
		requestModels: { [jsonMimeType]: outageRequestModel },
		methodResponses: [
			{
				statusCode: ResponseCodes.Success,
			},
			{
				statusCode: ResponseCodes.BadRequest,
			},
			{
				statusCode: ResponseCodes.Unauthorized,
			},
			{
				statusCode: ResponseCodes.Forbidden,
			},
			{
				statusCode: ResponseCodes.InternalServerError,
			},
		],
		apiKeyRequired: false,
	});

	return krakenApi;
};
