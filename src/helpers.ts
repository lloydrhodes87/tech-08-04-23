import { SSM } from 'aws-sdk';
import { ParamTuple } from './constants';
import { Device, Outage, SiteInfo } from './types/interfaces';

const paramStore = new SSM();

export const loadParam = async (param: ParamTuple): Promise<string> => {
	const paramStored = await paramStore
		.getParameter({ Name: param, WithDecryption: true })
		.promise();
	const result = paramStored.Parameter?.Value;

	if (!result) throw new Error(`Missing param setting ${param}`);

	return result;
};

export const filterOutages = (outages: Outage[], siteInfo: SiteInfo) => {
	const filteredOutages = outages.filter((outage) => {
		return (
			outageIsAfterDate(outage.begin) &&
			outageHasIdInDeviceList(outage.id, siteInfo.devices)
		);
	});
	return filteredOutages;
};

export const outageIsAfterDate = (outageDate: string) => {
	return new Date(outageDate) >= new Date('2022-01-01T00:00:00.000Z');
};

export const outageHasIdInDeviceList = (
	outageId: string,
	devices: { id: string }[],
) => {
	return devices.find(({ id }) => id === outageId);
};

export const attachOutageDisplayName = (
	outages: Outage[],
	devices: Device[],
) => {
	return outages.map((outage) => {
		return {
			...outage,
			name: devices.find((device) => device.id === outage.id)?.name,
		};
	});
};
