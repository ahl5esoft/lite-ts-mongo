import { notStrictEqual, strictEqual } from 'assert';
import { AreaDbModel, DbFactoryBase, DbModel, IUnitOfWorkRepository } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { MongoAreaDbFactory } from './area-db-factory';
import { AreaUnitOfWork as Self } from './area-unit-of-work';

class TestModel extends DbModel { }

describe('src/area-unit-of-work.ts', () => {
    after(async () => { });

    before(async () => { });

    describe('.commit()', () => {
        it('ok', async () => {
            const areaDbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();

            const self = new Self(areaDbFactoryMock.actual, globalDbFactoryMock.actual);
            self.registerAdd(TestModel.name, new AreaDbModel(1, {
                id: '1',
            }));

            const dbFactoryMock = new Mock<DbFactoryBase>();
            areaDbFactoryMock.expectReturn(
                r => r.getAreaDbFactory(1),
                dbFactoryMock.actual
            );

            let commitCount = 0;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                async commit() {
                    commitCount++;
                }
            });
            dbFactoryMock.expectReturn(
                r => r.uow(),
                uowMock.actual
            );

            uowMock.expectReturn(
                r => r.registerAdd(TestModel.name, mockAny),
                null,
            );

            await self.commit();

            strictEqual(commitCount, 1);
        });
    });

    describe('.registerAdd(model: Function, entry: AreaDbModel)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerAdd(TestModel.name, new AreaDbModel(1, {
                id: '1',
            }));

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[1].length, 1);
        });

        it('no areaNo', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerAdd(TestModel.name, {
                id: '1',
            } as AreaDbModel);

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[0].length, 1);
        });
    });

    describe('.registerAfter(action: () => Promise<void>, key?: string)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            const action = async () => {
                console.log(1);
            };
            self.registerAfter(action);

            const afterActions = Reflect.get(self, 'm_AfterAction');
            strictEqual(afterActions['key-0'], action);
        });
    });

    describe('.registerRemove(model: Function, entry: AreaDbModel)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerRemove(TestModel.name, new AreaDbModel(1, {
                id: '1',
            }));

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[1].length, 1);
        });

        it('no areaNo', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerRemove(TestModel.name, {
                id: '1',
            } as AreaDbModel);

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[0].length, 1);
        });
    });

    describe('.registerSave(model: Function, entry: AreaDbModel)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerSave(TestModel.name, new AreaDbModel(1, {
                id: '1',
            }));

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[1].length, 1);
        });

        it('no areaNo', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerSave(TestModel.name, {
                id: '1',
            } as AreaDbModel);

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[0].length, 1);
        });
    });
});