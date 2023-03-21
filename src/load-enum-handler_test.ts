import { deepStrictEqual } from 'assert';
import { DbFactoryBase, IDbQuery, IDbRepository } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { Enum } from './enum';
import { LoadMongoEnumHandler as Self } from './load-enum-handler';

describe('src/load-enum-handler.ts', () => {
    describe('.handle(opt: LoadEnumHandleOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual);

            const mockDbRepo = new Mock<IDbRepository<Enum>>();
            mockDbFactory.expectReturn(
                r => r.db(mockAny, mockAny),
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

            const opt = {
                enum: {
                    name: 'tt'
                } as any,
                res: {
                    a: 1
                }
            };
            await self.handle(opt);
            deepStrictEqual(opt.res, {
                2: {
                    value: 2
                }
            });
        });
    });
});