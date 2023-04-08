import { Handler } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DLQ_URL } from '../../constants';
const sqsClient = new SQSClient({ region: 'eu-west-1' });

export const handler: Handler = async (input, context, callback) => {
	const params = {
		MessageBody: input.errorMessage,
		QueueUrl: DLQ_URL,
	};

	try {
		await sqsClient.send(new SendMessageCommand(params));
		callback(input.errorMessage);
	} catch (err) {
		const combinedErrors = {
			sqsError: err,
			StackError: input.errorMessage,
		};
		callback(JSON.stringify(combinedErrors));
	}
};
