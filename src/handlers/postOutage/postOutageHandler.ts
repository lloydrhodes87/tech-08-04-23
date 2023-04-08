import { Handler } from 'aws-lambda';
import { loadParam } from '../../helpers';
import { OutagesRequest } from '../../types/outagesRequest';
import { OutagesResponse } from '../../types/outagesResponse';

export const handler: Handler<OutagesRequest, OutagesResponse> = async (
	input,
	context,
	callback,
) => {
	try {
		if (input.forceError) {
			callback(
				new Error(`An error was forced for site: ${input.siteId}`),
			);

			const apiKey = await loadParam('kraken-api-key');
		}
	} catch (error) {
		return callback(new Error(`Error: ${error}`));
	}
};
