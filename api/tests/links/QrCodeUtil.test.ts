import { toDataURL } from 'qrcode';
import { QrCodeUtil } from '../../src/utils/QrCodeUtil';
import { CAMINHO_BASE } from '../../src/config/CaminhoBase';

describe('QR Code do link', () => {
    const origemAnterior = process.env.APP_ORIGEM;
    afterEach(() => {
        if (origemAnterior === undefined) {
            delete process.env.APP_ORIGEM;
        } else {
            process.env.APP_ORIGEM = origemAnterior;
        }
    });

    it('codifica o endereço curto público, incluindo o prefixo da aplicação', async () => {
        process.env.APP_ORIGEM = 'https://breve.example/';
        const imagem = await QrCodeUtil.gerar('Minha-campanha');
        const esperada = await toDataURL(`https://breve.example${CAMINHO_BASE}/Minha-campanha`, {
            type: 'image/png',
            errorCorrectionLevel: 'M',
            margin: 4,
            width: 512,
            color: { dark: '#000000', light: '#ffffff' }
        });
        expect(imagem).toBe(esperada);
        const bytes = Buffer.from(imagem.split(',')[1]!, 'base64');
        expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        expect(bytes.readUInt32BE(16)).toBe(512);
        expect(bytes.readUInt32BE(20)).toBe(512);
        expect(await QrCodeUtil.gerar('Outro-link')).not.toBe(imagem);
    });

    it('recusa gerar um código sem endereço público configurado', () => {
        delete process.env.APP_ORIGEM;
        expect(() => QrCodeUtil.gerar('abc123')).toThrow('APP_ORIGEM');
    });
});
