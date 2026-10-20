import type { Config } from 'jest';

const configuracao: Config = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts']
};
export default configuracao;
