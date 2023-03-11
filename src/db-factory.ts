import { DbFactoryBase, DbOption, DbModel } from 'lite-ts-db';
import { BulkWriteOptions } from 'mongodb';

import { DbPool } from './db-pool';
import { DbRepository } from './db-repository';
import { DistributedUnitOfWork } from './distributed-unit-of-work';
import { UnitOfWork } from './unit-of-work';

export class MongoDbFactory extends DbFactoryBase {
    public pool: DbPool;

    public constructor(
        private m_IsDistributed: boolean,
        name: string,
        url: string,
        private m_BlukWriteOptions?: BulkWriteOptions,
    ) {
        super();

        this.pool = new DbPool(name, url);
    }

    public db<T extends DbModel>(...dbOptions: DbOption[]) {
        const dbRepository = new DbRepository<T>(this, dbOptions, this.uow());
        for (const r of dbOptions)
            r(dbRepository);

        return dbRepository;
    }

    public uow() {
        const ctor = this.m_IsDistributed ? DistributedUnitOfWork : UnitOfWork;
        return new ctor(this.m_BlukWriteOptions, this.pool);
    }
}