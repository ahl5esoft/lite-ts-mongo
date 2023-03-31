import { strictEqual } from 'assert';
import { DbFactoryBase, IDbQuery, IDbRepository } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { MongoUserRandSeedService as Self, UserRandSeed } from './user-rand-seed-service';

describe('src/user-rand-seed-service.ts', () => {
    describe('.get(uow: IUnitOfWork, len: number, offset?: number)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(0, dbFactoryMock.actual, [8, 16], '', 'userID');

            const dbRepositoryMock = new Mock<IDbRepository<UserRandSeed>>();
            dbFactoryMock.expectReturn(
                r => r.db<UserRandSeed>(mockAny, mockAny, mockAny),
                dbRepositoryMock.actual
            );

            const dbQueryMock = new Mock<IDbQuery<UserRandSeed>>();
            dbRepositoryMock.expectReturn(
                r => r.query(),
                dbQueryMock.actual
            );

            dbQueryMock.expectReturn(
                r => r.toArray({
                    where: {
                        id: 'userID'
                    }
                }),
                [
                    {
                        id: 'userID',
                        seed: {
                            '': '18385906392310'
                        }
                    }
                ]
            );

            const res = await self.get(null, 2, 2);
            strictEqual(res, 38);
        });
    });

    describe('.use(uow: IUnitOfWork, len: number)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(0, dbFactoryMock.actual, [8, 16], '', 'userID');

            const dbRepositoryMock = new Mock<IDbRepository<UserRandSeed>>();
            dbFactoryMock.expectReturn(
                r => r.db<UserRandSeed>(mockAny, mockAny, mockAny),
                dbRepositoryMock.actual
            );

            const dbQueryMock = new Mock<IDbQuery<UserRandSeed>>();
            dbRepositoryMock.expectReturn(
                r => r.query(),
                dbQueryMock.actual
            );

            dbQueryMock.expectReturn(
                r => r.toArray({
                    where: {
                        id: 'userID'
                    }
                }),
                [
                    {
                        id: 'userID',
                        seed: {
                            '': '18385906392310'
                        }
                    }
                ]
            );

            dbFactoryMock.expectReturn(
                r => r.db<UserRandSeed>(mockAny, mockAny, mockAny),
                dbRepositoryMock.actual
            );

            dbRepositoryMock.expected.save({
                id: 'userID',
                seed: {
                    '': '385906392310'
                }
            });

            const res = await self.use(null, 2);
            strictEqual(res, 18);
        });
    });
});