import { deepStrictEqual, strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { MongoConfigCache as Self } from './config-cache';
import { Config } from './config';
import { IDbFactory } from './i-db-factory';
import { IDbQuery } from './i-db-query';
import { IDbRepository } from './i-db-repository';
import { IRedis } from './i-redis';

describe('src/config-cache.ts', () => {
    describe('.withTrace(parentSpan: any)', () => {
        it('ok', async () => {
            const self = new Self({} as IDbFactory, Config, {} as IRedis, null);
            self.updateOn = 100;

            const res = self.withTrace({});
            strictEqual(res.updateOn, self.updateOn);
        });
    });

    describe('.load()', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<IDbFactory>();
            const self = new Self(dbFactoryMock.actual, Config, null, null);

            const dbRepositoryMock = new Mock<IDbRepository<Config>>();
            dbFactoryMock.expectReturn(
                r => r.db(Config),
                dbRepositoryMock.actual
            );

            const dbQueryMock = new Mock<IDbQuery<Config>>();
            dbRepositoryMock.expectReturn(
                r => r.query(),
                dbQueryMock.actual
            );

            dbQueryMock.expectReturn(
                r => r.toArray(),
                [
                    {
                        id: '1',
                        items: {}
                    },
                    {
                        id: '2',
                        items: {}
                    }
                ]
            );

            const fn = Reflect.get(self, 'load').bind(self) as () => Promise<{ [key: string]: any; }>;
            const res = await fn();
            deepStrictEqual(res, {
                '1': {},
                '2': {}
            });
        });
    });
});