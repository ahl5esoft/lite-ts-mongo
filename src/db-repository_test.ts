import { deepStrictEqual, strictEqual } from 'assert';
import { DbFactoryBase, DbModel } from 'lite-ts-db';
import { Mock } from 'lite-ts-mock';

import { areaDbOption, DbRepository as Self, modelDbOption, uowDbOption } from './db-repository';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

class TestModel extends DbModel { }

describe('src/db-repository.ts', () => {
    describe('.add(entry: T)', () => {
        it('ok', async () => {
            const dbFactory = new Mock<DbFactoryBase>();

            let registerAddCount = 0;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                registerAdd(_: Function, __: TestModel) {
                    registerAddCount++;
                }
            });

            const dbOptions = [
                modelDbOption(TestModel),
                uowDbOption(uowMock.actual)
            ];

            const self = new Self(dbFactory.actual, dbOptions, uowMock.actual);

            for (const r of dbOptions)
                r(self);

            const entry = {
                id: '1'
            };

            await self.add(entry);

            strictEqual(registerAddCount, 1);
        });

        it('ok (区服)', async () => {
            const dbFactory = new Mock<DbFactoryBase>({
                getAreaDbFactory() {
                    return null;
                }
            });

            let addEntry: any;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                registerAdd(_: Function, entry: TestModel) {
                    addEntry = entry;
                }
            });

            const dbOptions = [
                modelDbOption(TestModel),
                uowDbOption(uowMock.actual),
                areaDbOption(1)
            ];

            const self = new Self(dbFactory.actual, dbOptions, uowMock.actual);

            for (const r of dbOptions)
                r(self);

            const entry = {
                id: '1'
            };

            await self.add(entry);

            deepStrictEqual(addEntry, {
                entry: {
                    id: '1'
                },
                areaNo: 1
            });
        });
    });

    describe('.remove(entry: T)', () => {
        it('ok', async () => {
            const dbFactory = new Mock<DbFactoryBase>();

            let registerRemoveCount = 0;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                registerRemove(_: Function, __: TestModel) {
                    registerRemoveCount++;
                }
            });

            const dbOptions = [
                modelDbOption(TestModel),
                uowDbOption(uowMock.actual)
            ];

            const self = new Self(dbFactory.actual, dbOptions, uowMock.actual);

            for (const r of dbOptions)
                r(self);

            const entry = {
                id: '1'
            };

            await self.remove(entry);

            strictEqual(registerRemoveCount, 1);
        });

        it('ok (区服)', async () => {
            const dbFactory = new Mock<DbFactoryBase>({
                getAreaDbFactory() {
                    return null;
                }
            });

            let removeEntry: any;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                registerRemove(_: Function, entry: TestModel) {
                    removeEntry = entry;
                }
            });

            const dbOptions = [
                modelDbOption(TestModel),
                uowDbOption(uowMock.actual),
                areaDbOption(1)
            ];

            const self = new Self(dbFactory.actual, dbOptions, uowMock.actual);

            for (const r of dbOptions)
                r(self);

            const entry = {
                id: '1'
            };

            await self.remove(entry);

            deepStrictEqual(removeEntry, {
                entry: {
                    id: '1'
                },
                areaNo: 1
            });
        });
    });

    describe('.save(entry: T)', () => {
        it('ok', async () => {
            const dbFactory = new Mock<DbFactoryBase>();

            let registerSaveCount = 0;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                registerSave(_: Function, __: TestModel) {
                    registerSaveCount++;
                }
            });

            const dbOptions = [
                modelDbOption(TestModel),
                uowDbOption(uowMock.actual)
            ];

            const self = new Self(dbFactory.actual, dbOptions, uowMock.actual);

            for (const r of dbOptions)
                r(self);

            const entry = {
                id: '1'
            };

            await self.save(entry);

            strictEqual(registerSaveCount, 1);
        });

        it('ok (区服)', async () => {
            const dbFactory = new Mock<DbFactoryBase>({
                getAreaDbFactory() {
                    return null;
                }
            });

            let saveEntry: any;
            const uowMock = new Mock<IUnitOfWorkRepository>({
                registerSave(_: Function, entry: TestModel) {
                    saveEntry = entry;
                }
            });

            const dbOptions = [
                modelDbOption(TestModel),
                uowDbOption(uowMock.actual),
                areaDbOption(1)
            ];

            const self = new Self(dbFactory.actual, dbOptions, uowMock.actual);

            for (const r of dbOptions)
                r(self);

            const entry = {
                id: '1'
            };

            await self.save(entry);

            deepStrictEqual(saveEntry, {
                entry: {
                    id: '1'
                },
                areaNo: 1
            });
        });
    });
});
