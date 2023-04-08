import { Handler } from 'aws-lambda';
import {
	attachOutageDisplayName,
	filterOutages,
	loadParam,
} from '../../helpers';
import { getOutages, getSiteById, postOutages } from '../../krakenService';
import { OutagesRequest } from '../../types/outagesRequest';
import { OutagesResponse } from '../../types/outagesResponse';

export const handler: Handler<OutagesRequest, OutagesResponse | void> = async (
	input,
	_context,
	callback,
) => {
	try {
		if (input.forceError) {
			callback(
				new Error(`An error was forced for site: ${input.siteId}`),
			);
		}

		const apiKey = await loadParam('kraken-api-key');
		const outages = await getOutages(apiKey);
		const sitesById = await getSiteById(input.siteId, apiKey);

		const filteredOutages = filterOutages(outages.data, sitesById.data);

		const namedOutages = attachOutageDisplayName(
			filteredOutages,
			sitesById.data.devices,
		);

		await postOutages(input.siteId, apiKey, namedOutages);

		return {
			statusCode: 200,
			message: 'The following outages have been submitted',
			outages: namedOutages,
		};
	} catch (error) {
		return callback(new Error(`Error: ${error}`));
	}
};
