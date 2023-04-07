import { deepStrictEqual, strictEqual } from 'assert';
import { CryptoBase } from 'lite-ts-crypto';
import { Mock } from 'lite-ts-mock';
import { Collection, Db, FindCursor } from 'mongodb';

import { CryptoDbQuery as Self } from './crypto-db-query';
import { DbPool } from './db-pool';
import { Enum } from './enum';

class Config {
    public id: string;
    public items: any;
}

describe('src/crypto-db-query.ts', () => {
    describe('.count(where?: Filter<any>)', () => {
        it('ok', async () => {
            const dbMock = new Mock<Db>();
            const mongoPoolMock = new Mock<DbPool>({
                get db() {
                    return dbMock.actual;
                }
            });
            const self = new Self({}, null, mongoPoolMock.actual, Config.name);

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
            const cryptoMock = new Mock<CryptoBase>();
            const self = new Self({
                [Config.name]: {
                    fields: ['items']
                }
            }, cryptoMock.actual, mongoPoolMock.actual, Config.name);

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
                        items: {
                            $ciphertext: 'aaa'
                        }
                    }
                ]
            );

            cryptoMock.expectReturn(
                r => r.decrypt('aaa'),
                "{}"
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

        it('枚举解密', async () => {
            const dbMock = new Mock<Db>();
            const mongoPoolMock = new Mock<DbPool>({
                get db() {
                    return dbMock.actual;
                }
            });
            const cryptoMock = new Mock<CryptoBase>();
            const self = new Self({
                [Enum.name]: {
                    fields: ['TestData.text']
                }
            }, cryptoMock.actual, mongoPoolMock.actual, Enum.name);

            const collectionMock = new Mock<Collection>();
            dbMock.expectReturn(
                r => r.collection(Enum.name),
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
                        _id: 'TestData',
                        items: [
                            {
                                text: {
                                    $ciphertext: 'bbb'
                                }
                            }
                        ]
                    }
                ]
            );

            cryptoMock.expectReturn(
                r => r.decrypt('bbb'),
                '"测试文本"'
            );

            const res = await self.toArray();
            deepStrictEqual(res, [
                {
                    id: 'TestData',
                    items: [
                        {
                            text: '测试文本'
                        }
                    ]
                }
            ]);
        });
    });
});