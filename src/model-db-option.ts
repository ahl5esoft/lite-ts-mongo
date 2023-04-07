import { AreaDbQuery, DbOption, DbRepository } from 'lite-ts-db';

import { MongoAreaDbFactory } from './area-db-factory';
import { CryptoMongoDbFactory } from './crypto-db-factory';
import { CryptoDbQuery } from './crypto-db-query';
import { MongoDbFactory } from './db-factory';
import { DbQuery } from './db-query';

export function modelDbOption(model: any): DbOption {
    return (dbFactory, dbRepo_) => {
        const dbRepo = dbRepo_ as DbRepository<any>;
        dbRepo.model = typeof model == 'string' ? model : model.ctor ?? model.name;
        dbRepo.createQueryFunc = () => {
            const isArea = dbFactory instanceof MongoAreaDbFactory;
            if (isArea && dbRepo.areaNo) {
                return new AreaDbQuery(
                    dbRepo.areaNo,
                    dbFactory,
                    dbRepo.dbOptions
                );
            }

            if (dbFactory instanceof CryptoMongoDbFactory) {
                return new CryptoDbQuery(
                    dbFactory.cryptoModel,
                    dbFactory.crypto,
                    dbFactory.pool,
                    dbRepo.model
                );
            }

            return new DbQuery(
                (dbFactory as MongoDbFactory).pool,
                dbRepo.model
            );
        };
    };
}