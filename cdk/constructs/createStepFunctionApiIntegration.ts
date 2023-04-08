import { aws_apigateway, aws_iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';
import path from 'path';
import { jsonMimeType, mappingTemplatePath } from '../constants';

export const createStepFunctionApiIntegration = (scope: Construct, stateMachineArn: string) => {
    const credentialsRole = new aws_iam.Role(scope, 'getRole', {
        assumedBy: new aws_iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    credentialsRole.attachInlinePolicy(
        new aws_iam.Policy(scope, 'getPolicy', {
            statements: [
                new aws_iam.PolicyStatement({
                    actions: ['states:StartExecution', 'states:StartSyncExecution'],
                    effect: aws_iam.Effect.ALLOW,
                    resources: [stateMachineArn],
                }),
            ],
        })
    );

    return new aws_apigateway.AwsIntegration({
        service: 'states',
        action: 'StartSyncExecution',
        integrationHttpMethod: 'POST',
        proxy: false,
        options: {
            credentialsRole,
            passthroughBehavior: aws_apigateway.PassthroughBehavior.NEVER,

            requestTemplates: {
                [jsonMimeType]: readFileSync(
                    path.join(process.cwd(), mappingTemplatePath, 'request-mapping-template.vtl'),
                    'utf8'
                )
                    .toString()
                    .replace('STATE_MACHINE_ARN', stateMachineArn),
            },
            integrationResponses: [
                {
                    statusCode: '200',
                    responseTemplates: {
                        [jsonMimeType]: readFileSync(
                            path.join(process.cwd(), mappingTemplatePath, 'response-mapping-template.vtl'),
                            'utf8'
                        ).toString(),
                    },
                },
            ],
        },
    });
};
