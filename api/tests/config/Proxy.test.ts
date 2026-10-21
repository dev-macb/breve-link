import express from 'express';
import request from 'supertest';
import { validarProxy } from '../../src/config/Proxy';

describe('confiança no proxy', () => {
    it('desabilita confiança quando vazio e aceita IPs/CIDRs explícitos', () => {
        expect(validarProxy(' ')).toBe(false);
        expect(validarProxy('127.0.0.1, ::1/128')).toEqual(['127.0.0.1', '::1/128']);
    });
    it.each([
        'true',
        '1',
        'loopback',
        '0.0.0.0/0',
        '::/0',
        '127.0.0.1/33',
        '::1/129',
        '127.0.0.1,',
        '127.0.0.1/x'
    ])('rejeita %s', (valor) => {
        expect(() => validarProxy(valor)).toThrow('TRUST_PROXY');
    });
    it('usa headers encaminhados somente quando o remetente é autorizado', async () => {
        for (const [proxy, confiavel] of [
            ['127.0.0.1/32,::1/128', true],
            ['192.0.2.1/32', false]
        ] as const) {
            const app = express();
            app.set('trust proxy', validarProxy(proxy));
            app.get('/', (req, res) => res.json({ ip: req.ip, protocolo: req.protocol }));
            const resposta = await request(app)
                .get('/')
                .set('X-Forwarded-For', '203.0.113.5')
                .set('X-Forwarded-Proto', 'https');
            expect(resposta.body.protocolo).toBe(confiavel ? 'https' : 'http');
            expect(resposta.body.ip === '203.0.113.5').toBe(confiavel);
        }
    });
});
