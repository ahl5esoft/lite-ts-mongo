import { strictEqual } from 'assert';

import { DbPool as Self } from './db-pool';

const self = new Self('lite-ts-mongo_it', 'mongodb://localhost:27017');

describe('src/pool.ts', () => {
    describe('.client', () => {
        it('ok', async () => {
            const clients = await Promise.all(
                [...new Array(10)].map(() => self.client)
            );
            const count = clients.slice(1).reduce((memo, r) => {
                return memo + (clients[0] == r ? 0 : 1);
            }, 0);
            strictEqual(count, 0);
        });
    });

    describe('.db', () => {
        it('ok', async () => {
            const dbs = await Promise.all(
                [...new Array(10)].map(() => self.db)
            );
            const count = dbs.slice(1).reduce((memo, r) => {
                return memo + (dbs[0] == r ? 0 : 1);
            }, 0);
            strictEqual(count, 0);
        });

        it('uri 带数据库名称', async () => {
            const self = new Self('lite-ts-mongo_it', 'mongodb://localhost:27017/framework-prop');
            const db = await self.db;
            strictEqual(db.databaseName, 'framework-prop');
        });
    });
});