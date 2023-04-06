import { DbFactoryBase, DbOption, DbModel, DbRepository, AreaDbFactoryBase, AreaUnitOfWork } from 'lite-ts-db';
import { EnumFactoryBase } from 'lite-ts-enum';
import { AesCrypto, CryptoBase } from 'lite-ts-crypto';

import { AreaData } from './area-data';
import { MongoDbFactory } from './db-factory';
import { EncryptAlgorithmType } from './encrypt-algorithm-type';
import { EncryptData } from './encrypt-data';

export class MongoAreaDbFactory extends AreaDbFactoryBase {
    private m_AllDbFactory: Promise<{ [areaNo: number]: DbFactoryBase; }>;

    private m_AllCrypto: Promise<{ [no: number]: CryptoBase; }>;

    public get pool() {
        return (this.m_GlobalDbFactory as MongoDbFactory).pool;
    }

    public constructor(
        private m_GlobalDbFactory: DbFactoryBase,
        private m_EnumFactory: EnumFactoryBase,
        private m_Name: string,
    ) {
        super();
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
        return new AreaUnitOfWork(this, this.m_GlobalDbFactory);
    }

    public async getAreaDbFactory(areaNo: number) {
        this.m_AllDbFactory ??= new Promise<{
            [areaNo: number]: DbFactoryBase;
        }>(async (s, f) => {
            try {
                const items = await this.m_EnumFactory.build<AreaData>(AreaData).items;
                const memo = {};
                for (const r of items) {
                    const connection = r.connectionString[this.m_Name];
                    if (connection) {
                        let mongoUrl: string;

                        if (typeof connection == 'string') {
                            mongoUrl = connection;
                        } else {
                            const crypto = await this.getCrypto(connection.encryptNo);
                            mongoUrl = await crypto.decrypt(connection.ciphertext);
                        }

                        memo[r.value] = new MongoDbFactory(false, this.m_Name, mongoUrl);
                    }
                }

                s(memo);
            } catch (ex) {
                f(ex);
            }
        });

        const allDbFactory = await this.m_AllDbFactory;
        if (!allDbFactory[areaNo])
            throw new Error(`缺少区服配置 ${areaNo}[${this.m_Name}]`);

        return allDbFactory[areaNo];
    }

    private async getCrypto(no: number) {
        this.m_AllCrypto ??= new Promise<{ [no: number]: CryptoBase; }>(async (s, f) => {
            try {
                const items = await this.m_EnumFactory.build(EncryptData).items;
                s(
                    items.reduce((memo, r) => {
                        if (r.algorithm == EncryptAlgorithmType.aes)
                            memo[r.value] = new AesCrypto(r.key);
                        return memo;
                    }, {})
                );
            } catch (ex) {
                f(ex);
            }
        });

        const allCrypto = await this.m_AllCrypto;
        if (!allCrypto[no])
            throw new Error(`缺少 ${EncryptData.name}[${no}]`);

        return allCrypto[no];
    }
}