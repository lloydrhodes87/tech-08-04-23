import {
	filterOutages,
	outageHasIdInDeviceList,
	outageIsAfterDate,
} from './helpers';
import { Device, Outage, SiteInfo } from './types/interfaces';

const outageTestData: Outage[] = [
	{
		id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
		begin: '2021-07-26T17:09:31.036Z',
		end: '2021-08-29T00:37:42.253Z',
	},
	{
		id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
		begin: '2022-05-23T12:21:27.377Z',
		end: '2022-11-13T02:16:38.905Z',
	},
	{
		id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
		begin: '2022-12-04T09:59:33.628Z',
		end: '2022-12-12T22:35:13.815Z',
	},
	{
		id: '04ccad00-eb8d-4045-8994-b569cb4b64c1',
		begin: '2022-07-12T16:31:47.254Z',
		end: '2022-10-13T04:05:10.044Z',
	},
	{
		id: '086b0d53-b311-4441-aaf3-935646f03d4d',
		begin: '2022-07-12T16:31:47.254Z',
		end: '2022-10-13T04:05:10.044Z',
	},
	{
		id: '27820d4a-1bc4-4fc1-a5f0-bcb3627e94a1',
		begin: '2021-07-12T16:31:47.254Z',
		end: '2022-10-13T04:05:10.044Z',
	},
];

const siteInfoTesData: SiteInfo = {
	id: 'kingfisher',
	name: 'KingFisher',
	devices: [
		{
			id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
			name: 'Battery 1',
		},
		{
			id: '086b0d53-b311-4441-aaf3-935646f03d4d',
			name: 'Battery 2',
		},
	],
};

describe('outageIsAfterDate', () => {
	it('should return true if outage date is after 2022-01-01T00:00:00.000Z', () => {
		expect(outageIsAfterDate('2022-10-01T00:00:00.000Z')).toBe(true);
		expect(outageIsAfterDate('2022-02-20T00:00:00.000Z')).toBe(true);
	});
	it('should return false if outage date is before 2022-01-01T00:00:00.000Z', () => {
		expect(outageIsAfterDate('2021-10-01T00:00:00.000Z')).toBe(false);
		expect(outageIsAfterDate('2021-12-31T11:59:59.000Z')).toBe(false);
	});
	it('should return true if outdate date is the same as 2022-01-01T00:00:00.000Z', () => {
		expect(outageIsAfterDate('2022-01-01T00:00:00.000Z')).toBe(true);
	});
});

describe('outageHasIdInDeviceList', () => {
	it('should return the device is the outage id appears in the device array', () => {
		// prettier-ignore
		const expectedDevice = {"id": "002b28fc-283c-47ec-9af2-ea287336dc1b", "name": "Battery 1"};
		expect(
			outageHasIdInDeviceList(
				'002b28fc-283c-47ec-9af2-ea287336dc1b',
				siteInfoTesData.devices,
			),
		).toEqual(expectedDevice);
	});
	it('should return undefined is the outage id does not appear in the device array', () => {
		expect(
			outageHasIdInDeviceList(
				'002b28fc-283c-47ec-9af2-ea287336d463',
				siteInfoTesData.devices,
			),
		).toBeUndefined();
	});
});

describe('filterOutages', () => {
	it(`should filter out any outages that began before 2022-01-01T00:00:00.000Z or don't have an ID that is in the list of devices in the site information`, () => {
		const filteredOutages = [
			{
				id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
				begin: '2022-05-23T12:21:27.377Z',
				end: '2022-11-13T02:16:38.905Z',
			},
			{
				id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
				begin: '2022-12-04T09:59:33.628Z',
				end: '2022-12-12T22:35:13.815Z',
			},
			{
				id: '086b0d53-b311-4441-aaf3-935646f03d4d',
				begin: '2022-07-12T16:31:47.254Z',
				end: '2022-10-13T04:05:10.044Z',
			},
		];

		expect(filterOutages(outageTestData, siteInfoTesData)).toEqual(
			filteredOutages,
		);
	});
});
