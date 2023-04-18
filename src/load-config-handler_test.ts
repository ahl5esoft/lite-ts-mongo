import { strictEqual } from 'assert';
import { LoadConfigHandleOption } from 'lite-ts-config';
import { DbFactoryBase, IDbQuery, IDbRepository } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { Config } from './config';
import { MongoLoadConfigHandler as Self } from './load-config-handler';

describe('src/load-config-handler.ts', () => {
    describe('.handle(opt: LoadConfigHandleOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual);

            const mockDbRepo = new Mock<IDbRepository<Config>>();
            mockDbFactory.expectReturn(
                r => r.db(mockAny, mockAny),
                mockDbRepo.actual
            );

            const mockDbQuery = new Mock<IDbQuery<Config>>();
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
                [
                    {
                        id: 'tt',
                        items: 1
                    }
                ]
            );

            const opt: LoadConfigHandleOption = {
                name: 'tt',
                areaNo: 0,
            };
            await self.handle(opt);
            strictEqual(opt.res, 1);
        });
    });
});