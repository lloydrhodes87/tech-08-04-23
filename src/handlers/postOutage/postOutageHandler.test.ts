import { getOutages, getSiteById, postOutages } from '../../krakenService';
import {
	outageTestData,
	siteInfoTesData,
	outagesWithNameTestData,
} from '../../testData';
import { handler } from './postOutageHandler';
import { mock } from 'jest-mock-extended';
import { AxiosResponse } from 'axios';

jest.mock('../../helpers', () => ({
	...jest.requireActual('../../helpers'),
	loadParam: jest.fn().mockResolvedValue('123'),
}));

jest.mock('../../krakenService');
const getSiteByIdMocked = jest.mocked(getSiteById);
const getOutagesMocked = jest.mocked(getOutages);
const postOutagesMocked = jest.mocked(postOutages);

const callback = jest.fn();

describe('postOutageHandler', () => {
	it('should return the mapped outages with a 200 status', async () => {
		const input = {
			forceError: false,
			siteId: 'norwich-pear-tree',
		};
		getOutagesMocked.mockResolvedValue({
			data: outageTestData,
		} as unknown as Promise<AxiosResponse<any, any>>);
		getSiteByIdMocked.mockResolvedValue({
			data: siteInfoTesData,
		} as unknown as Promise<AxiosResponse<any, any>>);

		const response = await handler(input, mock(), callback);

		expect(postOutagesMocked).toBeCalledWith(
			'norwich-pear-tree',
			'123',
			outagesWithNameTestData,
		);

		expect(response).toEqual({
			statusCode: 200,
			message: 'The following outages have been submitted',
			outages: outagesWithNameTestData,
		});
	});

	it('should throw an error if shouldError is set to true', async () => {
		const input = {
			forceError: true,
			siteId: 'norwich-pear-tree',
		};
		await handler(input, mock(), callback);

		expect(callback).toBeCalledWith(
			new Error(`An error was forced for site: ${input.siteId}`),
		);
	});
});
