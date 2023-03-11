import { DbModel, DbOption, IDbQuery, IDbQueryOption } from 'lite-ts-db';
import { Filter } from 'mongodb';

import { MongoAreaDbFactory } from './area-db-factory';

export class AreaDbQuery<T extends DbModel> implements IDbQuery<T> {
    public constructor(
        private m_AreaNo: number,
        private m_DbFactory: MongoAreaDbFactory,
        private m_DbOptions: DbOption[],
    ) { }

    public async count(where?: Filter<any>) {
        const dbFactory = await this.m_DbFactory.getAreaDbFactory(this.m_AreaNo);
        return await dbFactory.db<T>(...this.m_DbOptions).query().count(where);
    }

    public async toArray(v?: IDbQueryOption<Filter<any>>) {
        const dbFactory = await this.m_DbFactory.getAreaDbFactory(this.m_AreaNo);
        return await dbFactory.db<T>(...this.m_DbOptions).query().toArray(v);
    }
}
