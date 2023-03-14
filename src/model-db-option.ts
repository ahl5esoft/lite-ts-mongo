import { DbOption, DbRepository } from 'lite-ts-db';

import { MongoAreaDbFactory } from './area-db-factory';
import { AreaDbQuery } from './area-db-query';
import { MongoDbFactory } from './db-factory';
import { DbQuery } from './db-query';

export function modelDbOption(model: any): DbOption {
    return (dbFactory, dbRepo_) => {
        const dbRepo = dbRepo_ as DbRepository<any>;
        dbRepo.model = typeof model == 'string' ? model : model.ctor ?? model.name;
        dbRepo.createQueryFunc(() => {
            const mongoAreaDbFactory = dbFactory as MongoAreaDbFactory;
            if (dbRepo.areaNo && mongoAreaDbFactory.getAreaDbFactory) {
                return new AreaDbQuery(
                    dbRepo.areaNo,
                    mongoAreaDbFactory,
                    dbRepo.dbOptions
                );
            }

            return new DbQuery(
                (dbFactory as MongoDbFactory).pool,
                dbRepo.model
            );
        });
    };
}