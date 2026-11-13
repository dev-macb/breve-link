import { toDataURL } from 'qrcode';
import { CAMINHO_BASE } from '../config/CaminhoBase';

export class QrCodeUtil {
    static gerar(urlCurta: string): Promise<string> {
        const origem = process.env.APP_ORIGEM;
        if (!origem) {
            throw new Error('APP_ORIGEM deve estar configurada para gerar QR Codes');
        }
        return toDataURL(`${origem.replace(/\/$/, '')}${CAMINHO_BASE}/${urlCurta}`, {
            type: 'image/png',
            errorCorrectionLevel: 'M',
            margin: 4,
            width: 512,
            color: { dark: '#000000', light: '#ffffff' }
        });
    }
}
