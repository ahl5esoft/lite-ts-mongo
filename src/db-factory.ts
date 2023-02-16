import { BulkWriteOptions } from 'mongodb';

import { IDbFactory } from './i-db-factory';
import { DbPool } from './db-pool';
import { DbRepository } from './db-repository';
import { DistributedUnitOfWork } from './distributed-unit-of-work';
import { UnitOfWork } from './unit-of-work';
import { UnitOfWorkBase } from './unit-of-work-base';

export class MongoDbFactory implements IDbFactory {
    private m_Pool: DbPool;

    public constructor(
        private m_IsDistributed: boolean,
        name: string,
        url: string,
        private m_BlukWriteOptions?: BulkWriteOptions,
    ) {
        this.m_Pool = new DbPool(name, url);
    }

    public db<T>(model: new () => T, uow?: UnitOfWorkBase) {
        return new DbRepository<T>(this.m_Pool, uow, this, model);
    }

    public uow() {
        const ctor = this.m_IsDistributed ? DistributedUnitOfWork : UnitOfWork;
        return new ctor(this.m_BlukWriteOptions, this.m_Pool);
    }
}