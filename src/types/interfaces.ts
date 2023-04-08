export interface Outage {
	id: string;
	begin: string;
	end: string;
}

export interface SiteInfo {
	id: string;
	name: string;
	devices: Device[];
}

export interface Device {
	id: string;
	name: string;
}

export interface NamedOutage extends Outage {
	name: string;
}
