export abstract class BaseService<T> {
    abstract findById(id: string): Promise<T | null>;
    abstract findAll(params?: unknown): Promise<T[]>;
    abstract create(data: unknown): Promise<T>;
    abstract update(id: string, data: unknown): Promise<T>;
    abstract delete(id: string): Promise<void>;

    protected assertFound<R>(entity: R | null, message = 'Resource not found'): R {
        if (!entity) {
            const err = new Error(message);
            (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
            throw err;
        }
        return entity;
    }
}
