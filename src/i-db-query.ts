import { DbQueryOption } from './db-query-option';

export interface IDbQuery<T> {
    count(where?: any): Promise<number>;
    toArray(v?: DbQueryOption<any>): Promise<T[]>;
}
