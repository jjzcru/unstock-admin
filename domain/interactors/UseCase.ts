export interface UseCase {
    execute(): Promise<any>;
}
