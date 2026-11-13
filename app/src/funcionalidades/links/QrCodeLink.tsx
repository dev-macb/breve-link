import { Download } from 'lucide-react';
import './qr-code.css';

export function QrCodeLink({ imagem, slug }: { imagem: string; slug: string }) {
    return (
        <section className="link-qr-code" aria-labelledby="qr-code-titulo">
            <img
                src={imagem}
                alt={`QR Code para acessar o link ${slug}`}
                width={192}
                height={192}
            />
            <div>
                <h2 id="qr-code-titulo">QR Code do link</h2>
                <p>
                    Escaneie com a câmera do celular para acessar ou baixe a imagem para
                    compartilhar.
                </p>
                <a className="button secondary" href={imagem} download={`breve-link-${slug}.png`}>
                    <Download size={14} />
                    Baixar QR Code
                </a>
            </div>
        </section>
    );
}
