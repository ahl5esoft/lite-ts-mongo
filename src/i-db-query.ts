export interface IDbQueryOption<T> {
    skip: number;
    take: number;
    where: T;
    order: string[];
    orderByDesc: string[];
}

export interface IDbQuery<T> {
    count(where?: any): Promise<number>;
    toArray(v?: Partial<IDbQueryOption<any>>): Promise<T[]>;
}
