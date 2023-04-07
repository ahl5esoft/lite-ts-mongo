import { AnyBulkWriteOperation, ClientSession } from 'mongodb';

import { CryptoUnitOfWorkBase } from './crypto-unit-of-work-base';

export class CryptoUnitOfWork extends CryptoUnitOfWorkBase {
    protected async commitWithSession(session: ClientSession, bulks: [string, AnyBulkWriteOperation[]][]) {
        const db = await this.pool.db;
        for (const r of bulks) {
            await db.collection(r[0]).bulkWrite(r[1], {
                ...this.blukWriteOptions,
                session,
            });
        }
    }
}
