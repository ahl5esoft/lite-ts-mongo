import { notStrictEqual, strictEqual } from 'assert';
import { DbFactoryBase, DbModel } from 'lite-ts-db';
import { Mock, mockAny } from 'lite-ts-mock';

import { MongoAreaDbFactory } from './area-db-factory';
import { AreaDbModel } from './area-db-model';
import { AreaUnitOfWork as Self } from './area-unit-of-work';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

class TestModel extends DbModel { }

describe('src/area-unit-of-work.ts', () => {
    after(async () => { });

    before(async () => { });

    describe('.commit()', () => {
        it('ok', async () => {
            const areaDbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();

            const self = new Self(areaDbFactoryMock.actual, globalDbFactoryMock.actual);
            self.registerAdd(TestModel, new AreaDbModel({
                entry: {
                    id: '1',
                },
                areaNo: 1
            } as any));

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
                r => r.registerAdd(TestModel, mockAny),
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

            self.registerAdd(TestModel, {
                entry: {
                    id: '1',
                },
                areaNo: 1
            } as AreaDbModel);

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[1].length, 1);
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

            self.registerRemove(TestModel, {
                entry: {
                    id: '1',
                },
                areaNo: 1
            } as AreaDbModel);

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[1].length, 1);
        });
    });

    describe('.registerSave(model: Function, entry: AreaDbModel)', () => {
        it('ok', async () => {
            const dbFactoryMock = new Mock<MongoAreaDbFactory>();
            const globalDbFactoryMock = new Mock<DbFactoryBase>();
            const self = new Self(dbFactoryMock.actual, globalDbFactoryMock.actual);

            self.registerSave(TestModel, {
                entry: {
                    id: '1',
                },
                areaNo: 1
            } as AreaDbModel);

            const bulks = Reflect.get(self, 'm_Bulk');
            notStrictEqual(bulks, undefined);
            strictEqual(bulks[1].length, 1);
        });
    });
});