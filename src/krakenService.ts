import axios, { AxiosError } from 'axios';
import { BASE_URL } from './constants';

const axiosInstance = axios.create({
	validateStatus: (status) => status >= 200 && status < 300,
	baseURL: BASE_URL,
});

export const getOutages = (apiKey: string) => {
	const headers = {
		contentType: 'application/json',
		'x-api-key': apiKey,
	};
	try {
		return axiosInstance.get(`outages`, { headers });
	} catch (error: unknown) {
		if (error instanceof AxiosError) {
			throw error.response?.data.message;
		} else {
			throw error;
		}
	}
};

export const getSiteById = (siteId: string, apiKey: string) => {
	const headers = {
		contentType: 'application/json',
		'x-api-key': apiKey,
	};
	try {
		return axiosInstance.get(`site-info/${siteId}`, { headers });
	} catch (error: unknown) {
		if (error instanceof AxiosError) {
			throw error.response?.data.message;
		} else {
			throw error;
		}
	}
};

export const postOutages = async (
	siteId: string,
	apiKey: string,
	outages: any,
) => {
	const headers = {
		contentType: 'application/json',
		'x-api-key': apiKey,
	};
	try {
		return await axiosInstance.post(`site-outages/${siteId}`, outages, {
			headers,
		});
	} catch (error: unknown) {
		if (error instanceof AxiosError) {
			throw error.response?.data.message;
		} else {
			throw error;
		}
	}
};
