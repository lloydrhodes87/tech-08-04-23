import { KrakenStackProps } from '../kraken-stack-props';

type GetResourceName = (
	props: KrakenStackProps,
	resourceType: string,
) => string;

export const getResourceName: GetResourceName = (props, resourceType) => {
	return `${props.componentId}-${resourceType}`;
};
