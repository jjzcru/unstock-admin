export interface Store {
    id?: string;
    name?: string;
    domain?: string;
}

interface Contact {
    phone?: string;
    email?: string;
    whatsapp?: string;
}

export interface StoreEmail {
    id?: string;
    storeId?: string;
    theme: EmailTheme;
}

interface EmailTheme {
    logo?: string;
    accent?: string;
}
