import { CryptoBase } from 'lite-ts-crypto';
import { DbModel } from 'lite-ts-db';
import { BulkWriteOptions } from 'mongodb';

import { DbPool } from './db-pool';
import { Enum } from './enum';
import { toDoc } from './helper';
import { UnitOfWorkBase } from './unit-of-work-base';

/**
 * 加密工作单元仓储
 */
export abstract class CryptoUnitOfWorkBase extends UnitOfWorkBase {

    public constructor(
        private m_CryptoModel: { [model: string]: { fields: string[]; }; },
        private m_Crypto: CryptoBase,
        blukWriteOptions: BulkWriteOptions,
        pool: DbPool,
    ) {
        super(blukWriteOptions, pool);
    }

    protected async getBulks(bulk: { [model: string]: { add: DbModel[]; remove: DbModel[]; save: DbModel[]; }; }) {
        const bulkEntries = Object.entries(bulk);
        const bulks = [];
        for (const [model, v] of bulkEntries) {
            const data = [];
            for (const r of v.add) {
                data.push({
                    insertOne: {
                        document: toDoc(
                            await this.encryptEntry(model, r)
                        )
                    }
                });
            }

            for (const r of v.remove) {
                data.push({
                    deleteOne: {
                        filter: {
                            _id: r.id
                        }
                    }
                });
            }

            for (const r of v.save) {
                const doc = toDoc(await this.encryptEntry(model, r));
                delete doc._id;
                data.push({
                    updateOne: {
                        filter: {
                            _id: r.id,
                        },
                        update: {
                            $set: doc,
                        }
                    }
                });
            }
            bulks.push([model, data]);
        }
        return bulks;
    }

    private async encryptEntry(model: string, entry: DbModel) {
        const cryptoModel = this.m_CryptoModel[model];
        if (cryptoModel) {
            if (model == Enum.name) {
                for (const cr of cryptoModel.fields) {
                    const [enumName, filed] = cr.split('.');
                    if (entry.id == enumName) {
                        for (const sr of (entry as Enum).items) {
                            if (sr[filed]) {
                                if (sr[filed].$ciphertext)
                                    continue;

                                sr[filed] = {
                                    $ciphertext: await this.m_Crypto.encrypt(
                                        JSON.stringify(sr[filed])
                                    )
                                };
                            }
                        }
                    }
                }
            } else {
                for (const field of cryptoModel.fields) {
                    if (entry[field]) {
                        if (entry[field].$ciphertext)
                            continue;

                        entry[field] = {
                            $ciphertext: await this.m_Crypto.encrypt(
                                JSON.stringify(entry[field])
                            )
                        };
                    }
                }
            }
        }

        return entry;
    }
}