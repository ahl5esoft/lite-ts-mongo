import { deepStrictEqual, strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';
import { Collection, Db, FindCursor } from 'mongodb';

import { DbPool } from './db-pool';
import { DbQuery as Self } from './db-query';

class Config {
    public id: string;
    public items: any;
}

describe('src/db-query.ts', () => {
    describe('.count(where?: Filter<any>)', () => {
        it('ok', async () => {
            const dbMock = new Mock<Db>();
            const mongoPoolMock = new Mock<DbPool>({
                get db() {
                    return dbMock.actual;
                }
            });
            const self = new Self(mongoPoolMock.actual, Config.name);

            const collectionMock = new Mock<Collection>();
            dbMock.expectReturn(
                r => r.collection(Config.name),
                collectionMock.actual
            );

            collectionMock.expectReturn(
                r => r.count(undefined),
                100
            );

            const res = await self.count();
            strictEqual(res, 100);
        });
    });

    describe('.toArray(v?: Partial<IDbQueryOption<Filter<any>>>)', () => {
        it('ok', async () => {
            const dbMock = new Mock<Db>();
            const mongoPoolMock = new Mock<DbPool>({
                get db() {
                    return dbMock.actual;
                }
            });
            const self = new Self(mongoPoolMock.actual, Config.name);

            const collectionMock = new Mock<Collection>();
            dbMock.expectReturn(
                r => r.collection(Config.name),
                collectionMock.actual
            );

            const cursorMock = new Mock<FindCursor>();
            collectionMock.expectReturn(
                r => r.find(undefined),
                cursorMock.actual
            );

            cursorMock.expectReturn(
                r => r.toArray(),
                [
                    {
                        _id: '1',
                        items: {}
                    },
                    {
                        _id: '2',
                        items: {}
                    }
                ]
            );
            const res = await self.toArray();
            deepStrictEqual(res, [
                {
                    id: '1',
                    items: {}
                },
                {
                    id: '2',
                    items: {}
                }
            ]);
        });
    });
});