import { DbFactoryBase, DbOption, DbModel, DbRepository } from 'lite-ts-db';
import { EnumFactoryBase } from 'lite-ts-enum';

import { AreaData } from './area-data';
import { AreaUnitOfWork } from './area-unit-of-work';
import { MongoDbFactory } from './db-factory';

export class MongoAreaDbFactory extends DbFactoryBase {
    private m_AllDbFactory: Promise<{
        [areaNo: number]: DbFactoryBase;
    }>;

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
        return new AreaUnitOfWork(this, this.m_GlobalDbFactory as MongoDbFactory);
    }

    public async getAreaDbFactory(areaNo: number) {
        this.m_AllDbFactory ??= new Promise<{
            [areaNo: number]: DbFactoryBase;
        }>(async (s, f) => {
            try {
                const items = await this.m_EnumFactory.build<AreaData>(AreaData).items;
                s(
                    items.reduce((memo, r) => {
                        if (r.connectionString[this.m_Name])
                            memo[r.value] = new MongoDbFactory(false, this.m_Name, r.connectionString[this.m_Name]);

                        return memo;
                    }, {})
                );
            } catch (ex) {
                f(ex);
            }
        });

        const allDbFactory = await this.m_AllDbFactory;
        if (!allDbFactory[areaNo])
            throw new Error(`缺少区服配置 ${areaNo}[${this.m_Name}]`);

        return allDbFactory[areaNo];
    }
}