module.exports = {
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/cdk'],
	testMatch: ['**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
};
