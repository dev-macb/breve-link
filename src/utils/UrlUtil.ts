class UrlUtil {
    private static readonly regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$|^www\.[^\s/$.?#].[^\s]*$/;
    private static readonly caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    static Gerar(tamanho: number): string {
        let codigo = '';
        
        for (let i = 0; i < tamanho; i++) {
            codigo += this.caracteres.charAt(Math.floor(Math.random() * this.caracteres.length));
        }

        return codigo;
    }

    static Validar(url: string): boolean {
        return this.regex.test(url);
    }
}


export { UrlUtil };