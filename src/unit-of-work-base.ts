import { DbModel, IUnitOfWorkRepository } from 'lite-ts-db';
import { AnyBulkWriteOperation, BulkWriteOptions, ClientSession } from 'mongodb';

import { DbPool } from './db-pool';
import { toDoc } from './helper';

/**
 * 工作单元仓储
 */
export abstract class UnitOfWorkBase implements IUnitOfWorkRepository {
    /**
     * 提交后函数
     */
    private m_AfterAction: { [key: string]: () => Promise<void>; } = {};

    private m_Bulks: {
        [model: string]: {
            add: DbModel[];
            remove: DbModel[];
            save: DbModel[];
        };
    } = {};

    public constructor(
        protected blukWriteOptions: BulkWriteOptions,
        protected pool: DbPool,
    ) { }

    /**
     * 提交
     */
    public async commit() {
        try {
            const bulks = await this.getBulks(this.m_Bulks);
            this.m_Bulks = {};
            if (!bulks.length)
                return;

            const client = await this.pool.client;
            const session = client.startSession({
                defaultTransactionOptions: {
                    writeConcern: {
                        w: 1
                    }
                }
            });
            await this.commitWithSession(session, bulks);
            await session.endSession();
        } finally {
            const tasks = Object.values(this.m_AfterAction).map(r => {
                return r();
            });
            await Promise.all(tasks);
        }
    }

    public registerAdd(model: string, entry: any) {
        this.m_Bulks[model] ??= {
            add: [],
            remove: [],
            save: []
        };
        this.m_Bulks[model].add.push(entry);
    }

    /**
     * 注册提交后函数
     * 
     * @param action 函数
     * @param key 键
     */
    public registerAfter(action: () => Promise<void>, key?: string) {
        key ??= `key-${Object.keys(this.m_AfterAction).length}`;
        this.m_AfterAction[key] = action;
    }

    public registerRemove(model: string, entry: any) {
        this.m_Bulks[model] ??= {
            add: [],
            remove: [],
            save: []
        };
        this.m_Bulks[model].remove.push(entry);
    }

    public registerSave(model: string, entry: any) {
        this.m_Bulks[model] ??= {
            add: [],
            remove: [],
            save: []
        };
        const index = this.m_Bulks[model].save.findIndex(r => {
            return r.id == entry.id;
        });
        if (index != -1)
            this.m_Bulks[model].save.splice(index, 1);

        this.m_Bulks[model].save.push(entry);
    }

    protected async getBulks(bulk: {
        [model: string]: {
            add: DbModel[];
            remove: DbModel[];
            save: DbModel[];
        };
    }): Promise<[string, AnyBulkWriteOperation[]][]> {
        const bulkEntries = Object.entries(bulk);
        const bulks = [];
        for (const [model, v] of bulkEntries) {
            const data = [];
            for (const r of v.add) {
                data.push({
                    insertOne: {
                        document: toDoc(r)
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
                const doc = toDoc(r);
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
    };

    protected abstract commitWithSession(session: ClientSession, bulks: [string, AnyBulkWriteOperation[]][]): Promise<void>;
}