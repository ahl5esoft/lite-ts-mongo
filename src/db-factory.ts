import { BulkWriteOptions } from 'mongodb';

import { IDbFactory } from './i-db-factory';
import { MongoDbRepository } from './db-repository';
import { MongoDefaultUnitOfWork } from './default-unit-of-work';
import { MongoDistributedUnitOfWork } from './distributed-unit-of-work';
import { MongoPool } from './pool';
import { MongoUnitOfWorkBase } from './unit-of-work-base';

export class MongoDbFactory implements IDbFactory {
    private m_Pool: MongoPool;

    public constructor(
        private m_IsDistributed: boolean,
        name: string,
        url: string,
        private m_BlukWriteOptions?: BulkWriteOptions,
    ) {
        this.m_Pool = new MongoPool(name, url);
    }

    public db<T>(model: new () => T, uow?: MongoUnitOfWorkBase) {
        return new MongoDbRepository<T>(this.m_Pool, uow, this, model);
    }

    public uow() {
        const ctor = this.m_IsDistributed ? MongoDistributedUnitOfWork : MongoDefaultUnitOfWork;
        return new ctor(this.m_BlukWriteOptions, this.m_Pool);
    }
}