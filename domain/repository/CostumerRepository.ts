import { Costumer } from '../model/Costumer';

export interface CostumerRepository {
    add(params: CreateParams): Promise<Costumer>;
    get(id: string): Promise<Costumer>;
}

export interface CreateParams {
    name: string;
    email: string;
    password: string;
}
