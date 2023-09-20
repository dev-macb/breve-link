// Declaração de constantes
const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$|^www\.[^\s/$.?#].[^\s]*$/;
const caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';


const gerar = (tamanho: number): string => {
    let codigo = '';
    
    for (let i = 0; i < tamanho; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return codigo;
};


const validar = (url: string): boolean => {
    return regex.test(url);
};


export const URLService = { gerar, validar };   