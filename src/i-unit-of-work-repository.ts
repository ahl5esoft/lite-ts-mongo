import { DbModel, IUnitOfWork } from 'lite-ts-db';

export interface IUnitOfWorkRepository extends IUnitOfWork {
    registerAdd(model: Function, entry: DbModel): void;
    registerRemove(model: Function, entry: DbModel): void;
    registerSave(model: Function, entry: DbModel): void;
}