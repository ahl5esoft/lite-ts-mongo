import { deepStrictEqual, strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { MongoEnumCache as Self } from './enum-cache';
import { EnumItem } from './enum-item';
import { Enum } from './enum';
import { IDbFactory } from './i-db-factory';
import { IDbQuery } from './i-db-query';
import { IDbRepository } from './i-db-repository';
import { IRedis } from './i-redis';

describe('src/config-cache.ts', () => {
    describe('.withTrace(parentSpan: any)', () => {
        it('ok', async () => {
            const self = new Self({} as IDbFactory, Enum, {} as IRedis, null);
            self.updateOn = 100;

            const res = self.withTrace({});
            strictEqual(res.updateOn, self.updateOn);
        });
    });

    describe('.load()', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<IDbFactory>();
            const self = new Self(dbFactoryMock.actual, Enum, null, null);

            const dbRepositoryMock = new Mock<IDbRepository<Enum>>();
            dbFactoryMock.expectReturn(
                r => r.db(Enum),
                dbRepositoryMock.actual
            );

            const dbQueryMock = new Mock<IDbQuery<Enum>>();
            dbRepositoryMock.expectReturn(
                r => r.query(),
                dbQueryMock.actual
            );

            dbQueryMock.expectReturn(
                r => r.toArray(),
                [
                    {
                        id: 'enum-1',
                        items: [
                            {
                                value: 1,
                                key: 'key-1-1'
                            }
                        ]
                    },
                    {
                        id: 'enum-2',
                        items: []
                    }
                ]
            );

            Self.buildItemFunc = (name, entry) => {
                return new EnumItem(entry, name);
            };
            const fn = Reflect.get(self, 'load').bind(self) as () => Promise<{ [key: string]: any; }>;
            const res = await fn();
            deepStrictEqual(res, {
                'enum-1': {
                    1: new EnumItem({
                        key: 'key-1-1',
                        value: 1
                    }, 'enum-1')
                },
                'enum-2': {}
            });
        });
    });
});