import { IDbQuery, DbQueryOption } from 'lite-ts-db';
import { Filter } from 'mongodb';

import { DbPool } from './db-pool';
import { toEntries } from './helper';

export class DbQuery<T> implements IDbQuery<T> {
    public constructor(
        private m_Pool: DbPool,
        private m_Table: string
    ) { }

    public async count(where?: Filter<any>) {
        this.setID(where);

        const db = await this.m_Pool.db;
        return db.collection(this.m_Table).count(where);
    }

    public async toArray(v?: DbQueryOption<Filter<any>>) {
        this.setID(v?.where);

        const db = await this.m_Pool.db;
        const cursor = db.collection(this.m_Table).find(v?.where);

        const sorts = [];
        this.appendSort(1, v?.order, sorts);
        this.appendSort(-1, v?.orderByDesc, sorts);
        if (sorts.length)
            cursor.sort(sorts);

        if (v?.skip > 0)
            cursor.skip(v.skip);

        if (v?.take > 0)
            cursor.limit(v.take);

        const rows = await cursor.toArray();
        return toEntries(rows);
    }

    private appendSort(order: 1 | -1, fields: string[], sorts: [string, number][]) {
        if (!fields?.length)
            return;

        for (let r of fields) {
            if (r == 'id')
                r = '_id';

            sorts.push([r, order]);
        }
    }

    private setID(v: Filter<any>) {
        if (!v?.id)
            return;

        v._id = v.id;
        delete v.id;
    }
}
