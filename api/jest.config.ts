import type { Config } from 'jest';

const configuracao: Config = {
    testEnvironment: 'node',
    // O encoder de PNG usa Math por pixel; evite consultas ao contexto externo da VM.
    sandboxInjectedGlobals: ['Math'],
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts']
};
export default configuracao;
