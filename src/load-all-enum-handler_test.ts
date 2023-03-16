import { deepStrictEqual } from 'assert';
import { DbFactoryBase, IDbQuery, IDbRepository } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { Enum } from './i-enum';
import { LoadMongoAllEnumHandler as Self } from './load-all-enum-handler';

describe('src/load-all-enum-handler.ts', () => {
    describe('.handle(opt: LoadEnumHandleOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual);

            const mockDbRepo = new Mock<IDbRepository<Enum>>();
            mockDbFactory.expectReturn(
                r => r.db(mockAny),
                mockDbRepo.actual
            );

            const mockDbQuery = new Mock<IDbQuery<Enum>>();
            mockDbRepo.expectReturn(
                r => r.query(),
                mockDbQuery.actual
            );

            mockDbQuery.expectReturn(
                r => r.toArray(),
                [{
                    id: 'ValueTypeData',
                    items: [{
                        value: 2
                    }]
                },
                {
                    id: 'b',
                    items: [{
                        value: 0
                    }]
                }]
            );

            const opt = {
                enum: null,
                res: {}
            };
            await self.handle(opt);
            deepStrictEqual(opt.res, {
                'ValueTypeData':{
                    2: {
                        value: 2
                    }
                },
                'b': {
                    0: {
                        value: 0
                    }
                }
            });
        });
    });
});