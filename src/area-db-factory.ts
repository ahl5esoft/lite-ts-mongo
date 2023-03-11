import { DbFactoryBase, DbOption, DbModel } from 'lite-ts-db';
import { EnumFactoryBase } from 'lite-ts-enum';

import { AreaData } from './area-data';
import { AreaUnitOfWork } from './area-unit-of-work';
import { MongoDbFactory } from './db-factory';
import { DbRepository } from './db-repository';

export class MongoAreaDbFactory extends DbFactoryBase {
    private m_AllDbFactory: {
        [areaNo: number]: DbFactoryBase;
    };

    public constructor(
        private m_GlobalDbFactory: DbFactoryBase,
        private m_EnumFactory: EnumFactoryBase,
        private m_Name: string,
    ) {
        super();
    }

    public db<T extends DbModel>(...dbOptions: DbOption[]) {
        const dbRepository = new DbRepository<T>(
            this,
            dbOptions,
            this.uow(),
        );
        for (const r of dbOptions)
            r(dbRepository);

        return dbRepository;
    }

    public uow() {
        return new AreaUnitOfWork(this, this.m_GlobalDbFactory as MongoDbFactory);
    }

    public async getAreaDbFactory(areaNo: number) {
        if (!this.m_AllDbFactory) {
            const items = await this.m_EnumFactory.build<AreaData>(AreaData).items;
            this.m_AllDbFactory = items.reduce((memo, r) => {
                if (r.connectionString[this.m_Name])
                    memo[r.value] = new MongoDbFactory(false, this.m_Name, r.connectionString[this.m_Name]);

                return memo;
            }, {});
        }

        if (!this.m_AllDbFactory[areaNo])
            throw new Error(`缺少区服配置 ${areaNo}[${this.m_Name}]`);

        return this.m_AllDbFactory[areaNo];
    }
}