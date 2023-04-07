import { CryptoBase } from 'lite-ts-crypto';
import { DbFactoryBase, DbOption, DbModel, DbRepository } from 'lite-ts-db';
import { BulkWriteOptions } from 'mongodb';

import { DbPool } from './db-pool';
import { CryptoDistributedUnitOfWork } from './crypto-distributed-unit-of-work';
import { CryptoUnitOfWork } from './crypto-unit-of-work';

export class CryptoMongoDbFactory extends DbFactoryBase {
    public pool: DbPool;

    public constructor(
        private m_IsDistributed: boolean,
        public cryptoModel: { [model: string]: { fields: string[]; }; },
        public crypto: CryptoBase,
        name: string,
        url: string,
        private m_BlukWriteOptions?: BulkWriteOptions,
    ) {
        super();

        this.pool = new DbPool(name, url);
    }

    public db<T extends DbModel>(...dbOptions: DbOption[]) {
        const dbRepository = new DbRepository<T>(
            this.uow(),
        );
        dbRepository.dbOptions = dbOptions;
        for (const r of dbOptions)
            r(this, dbRepository);
        return dbRepository;
    }

    public uow() {
        const ctor = this.m_IsDistributed ? CryptoDistributedUnitOfWork : CryptoUnitOfWork;
        return new ctor(this.cryptoModel, this.crypto, this.m_BlukWriteOptions, this.pool);
    }
}