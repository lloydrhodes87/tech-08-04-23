import {
	attachOutageDisplayName,
	filterOutages,
	outageHasIdInDeviceList,
	outageIsAfterDate,
} from './helpers';
import {
	filteredOutages,
	outagesWithNameTestData,
	outageTestData,
	siteInfoTesData,
} from './testData';

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
		expect(filterOutages(outageTestData, siteInfoTesData)).toEqual(
			filteredOutages,
		);
	});
});

describe('attachOutageDisplayName', () => {
	it('should attach a display name to the filtered list of outages', () => {
		expect(
			attachOutageDisplayName(filteredOutages, siteInfoTesData.devices),
		).toEqual(outagesWithNameTestData);
	});
});
