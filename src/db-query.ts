import { IDbQuery, DbQueryOption } from 'lite-ts-db';
import { AbstractCursor, Filter } from 'mongodb';

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
        let cursor: AbstractCursor;
        const db = await this.m_Pool.db;
        if (Array.isArray(v?.where)) {
            cursor = db.collection(this.m_Table).aggregate(v.where);
        } else {
            this.setID(v?.where);

            const findCursor = db.collection(this.m_Table).find(v?.where);

            const sorts = [];
            this.appendSort(1, v?.order, sorts);
            this.appendSort(-1, v?.orderByDesc, sorts);
            if (sorts.length)
                findCursor.sort(sorts);

            if (v?.skip > 0)
                findCursor.skip(v.skip);

            if (v?.take > 0)
                findCursor.limit(v.take);

            cursor = findCursor;
        }

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
