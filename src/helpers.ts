import { SSM } from 'aws-sdk';
import { ParamTuple } from './constants';


const paramStore = new SSM();

export const loadParam = async (param: ParamTuple): Promise<string> => {
	const paramStored = await paramStore
		.getParameter({ Name: param, WithDecryption: true })
		.promise();
	const result = paramStored.Parameter?.Value;

	if (!result) throw new Error(`Missing param setting ${param}`);

	return result;
};

