import { DbFactoryBase, IDbQuery, IDbRepository } from 'lite-ts-db';
import { EnumItem } from 'lite-ts-enum';
import { Mock, mockAny } from 'lite-ts-mock';
import { RedisBase } from 'lite-ts-redis';

import { MongoEnum as Self } from './enum';

describe('src/enum.ts', () => {
    describe('save', () => {
        // 新增但不备份
        it('add but not backup', async () => {
            const name = 'aaa';
            const areaNo = 10001;
            const mockDbFactory = new Mock<DbFactoryBase>();
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(
                name,
                areaNo,
                mockDbFactory.actual,
                mockRedis.actual
            );

            const items = [
                {
                    value: 1,
                    key: 'one'
                },
                {
                    value: 2,
                    key: 'two'
                }
            ] as EnumItem[];
            const mockDbQuery = new Mock<IDbQuery<{ id: string, items: EnumItem[]; }>>();
            mockDbQuery.expectReturn(
                r => r.toArray(mockAny),
                []
            );
            const mockDbRepo = new Mock<IDbRepository<{ id: string, items: EnumItem[]; }>>();
            mockDbRepo.expectReturn(
                r => r.query(),
                mockDbQuery.actual
            );
            mockDbFactory.expectReturn(
                r => r.db(mockAny, mockAny),
                mockDbRepo.actual
            );

            mockDbRepo.expected.add({
                id: name,
                items: items
            });

            await self.save(items);
        });
        // 修改并且备份
        it('save and backup', async () => {
            const name = 'aaa';
            const areaNo = 10001;
            const mockDbFactory = new Mock<DbFactoryBase>();
            const mockRedis = new Mock<RedisBase>();
            const self = new Self(
                name,
                areaNo,
                mockDbFactory.actual,
                mockRedis.actual
            );

            const saveItems = [
                {
                    value: 3,
                    key: 'three'
                },
                {
                    value: 4,
                    key: 'four'
                }
            ] as EnumItem[];

            const expire = 5;
            mockRedis.expected.set(
                `Enum:Backup:${name}`,
                JSON.stringify(saveItems),
                'EX',
                expire
            );

            const mockDbQuery = new Mock<IDbQuery<{ id: string, items: EnumItem[]; }>>();
            mockDbQuery.expectReturn(
                r => r.toArray({ where: { id: name } }),
                [{
                    id: name,
                    items: [{
                        value: 1,
                        key: 'one'
                    },
                    {
                        value: 2,
                        key: 'two'
                    }]
                }]
            );
            const mockDbRepo = new Mock<IDbRepository<{ id: string, items: EnumItem[]; }>>();
            mockDbRepo.expectReturn(
                r => r.query(),
                mockDbQuery.actual
            );
            mockDbFactory.expectReturn(
                r => r.db(mockAny, mockAny),
                mockDbRepo.actual
            );

            mockDbRepo.expected.save({
                id: name,
                items: saveItems
            });

            await self.save(saveItems, expire);
        });
    });
});