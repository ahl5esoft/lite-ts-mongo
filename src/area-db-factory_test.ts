import { notStrictEqual, strictEqual } from 'assert';
import { AesCrypto } from 'lite-ts-crypto';
import { DbModel } from 'lite-ts-db';
import { Enum, EnumFactoryBase } from 'lite-ts-enum';
import { Mock } from 'lite-ts-mock';

import { AreaData } from './area-data';
import { MongoAreaDbFactory as Self } from './area-db-factory';
import { MongoDbFactory } from './db-factory';
import { EncryptAlgorithmType } from './encrypt-algorithm-type';
import { EncryptData } from './encrypt-data';
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

        it('加密', async () => {
            const enumFactoryMock = new Mock<EnumFactoryBase>();
            const self = new Self(null, enumFactoryMock.actual, 'test');

            const key = 'sdhg83hignbdosngksdkg102c7rfkgks';
            const ciphertext = await new AesCrypto(key).encrypt('mongodb://localhost:27017');

            const enumMock = new Mock<Enum<AreaData>>({
                get items() {
                    return Promise.resolve([
                        {
                            value: 1,
                            connectionString: {
                                test: {
                                    ciphertext: ciphertext,
                                    encryptNo: 1
                                }
                            }
                        }
                    ]);
                }
            });
            enumFactoryMock.expectReturn(
                r => r.build(AreaData),
                enumMock.actual
            );

            const encryptEnumMock = new Mock<Enum<EncryptData>>({
                get items() {
                    return Promise.resolve([
                        {
                            value: 1,
                            key: key,
                            algorithm: EncryptAlgorithmType.aes
                        }
                    ]);
                }
            });
            enumFactoryMock.expectReturn(
                r => r.build(EncryptData),
                encryptEnumMock.actual
            );

            const res = await self.getAreaDbFactory(1);
            notStrictEqual(res, undefined);
            const pool = Reflect.get(res, 'pool');
            notStrictEqual(pool, undefined);
            strictEqual(Reflect.get(pool, 'm_Url'), 'mongodb://localhost:27017');
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