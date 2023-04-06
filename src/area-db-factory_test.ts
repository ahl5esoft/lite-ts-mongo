import { notStrictEqual, strictEqual } from 'assert';
import { DbModel } from 'lite-ts-db';
import { Enum, EnumFactoryBase } from 'lite-ts-enum';
import { Mock } from 'lite-ts-mock';

import { AreaData } from './area-data';
import { MongoAreaDbFactory as Self } from './area-db-factory';
import { MongoDbFactory } from './db-factory';
import { modelDbOption } from './model-db-option';

class TestModel extends DbModel { }

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

    describe('.db<T extends DbModel>(...dbOptions: DbOption[])', () => {
        it('ok', async () => {
            const mongoDbFactoryMock = new Mock<MongoDbFactory>({
                get pool() {
                    return 'pool';
                }
            });
            const self = new Self(mongoDbFactoryMock.actual, null, 'test');

            const res = self.db(modelDbOption(TestModel));
            notStrictEqual(res, undefined);

            const query = res.query();
            strictEqual(Reflect.get(query, 'm_Pool'), 'pool');
        });
    });
});