import { Handler } from 'aws-lambda';

export const handler: Handler = async (input, context, callback) => {
	console.log(input, context);
	callback(input.errorMessage);
};
