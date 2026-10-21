export function origensPermitidas(): string[] {
    return [process.env.APP_ORIGEM, ...(process.env.CORS_ORIGENS ?? '').split(',')].filter(
        (origem): origem is string => Boolean(origem)
    );
}
