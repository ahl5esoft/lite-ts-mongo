import { notStrictEqual } from 'assert';
import { Enum, EnumFactoryBase } from 'lite-ts-enum';
import { Mock } from 'lite-ts-mock';

import { AreaData } from './area-data';
import { MongoAreaDbFactory as Self } from './area-db-factory';

describe('src/area-db-factory.ts', () => {
    describe('.getAreaDbFactory(areaNo: number)', () => {
        it('ok', async () => {
            const enumFactoryMock = new Mock<EnumFactoryBase>();
            const self = new Self(null, enumFactoryMock.actual, 'test');

            const enumMock = new Mock<Enum<AreaData>>({
                get items() {
                    return Promise.resolve([
                        {
                            value: 1,
                            connectionString: {
                                test: 'mongodb://localhost:27017'
                            }
                        }
                    ]);
                }
            });
            enumFactoryMock.expectReturn(
                r => r.build(AreaData),
                enumMock.actual
            );

            const res = await self.getAreaDbFactory(1);
            notStrictEqual(res, undefined);
        });
    });
});