import { deepStrictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { IDbFactory } from './i-db-factory';
import { IDbQuery } from './i-db-query';
import { IDbRepository } from './i-db-repository';
import { Enum, LoadMongoEnumHandler as Self } from './load-enum-handler';

describe('src/load-enum-handler.ts', () => {
    describe('.handle(enumerator: Enumerator<any>, res: { [no: number]: any; })', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<IDbFactory>();
            const self = new Self(mockDbFactory.actual);

            const mockDbRepo = new Mock<IDbRepository<Enum>>();
            mockDbFactory.expectReturn(
                r => r.db(Enum),
                mockDbRepo.actual
            );

            const mockDbQuery = new Mock<IDbQuery<Enum>>();
            mockDbRepo.expectReturn(
                r => r.query(),
                mockDbQuery.actual
            );

            mockDbQuery.expectReturn(
                r => r.toArray({
                    where: {
                        id: 'tt'
                    }
                }),
                [{
                    id: '',
                    items: [{
                        value: 2
                    }]
                } as Enum]
            );

            const res = { a: 1 };
            await self.handle({
                name: 'tt'
            } as any, res);
            deepStrictEqual(res, {
                2: {
                    value: 2
                }
            });
        });
    });
});