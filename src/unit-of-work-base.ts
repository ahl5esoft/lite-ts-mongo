import { AnyBulkWriteOperation, BulkWriteOptions, ClientSession } from 'mongodb';

import { toDoc } from './helper';
import { IUnitOfWork } from './i-unit-of-work';
import { MongoPool } from './pool';

/**
 * 工作单元仓储
 */
export abstract class MongoUnitOfWorkBase implements IUnitOfWork {
    /**
     * 提交后函数
     */
    private m_AfterAction: { [key: string]: () => Promise<void>; } = {};

    private m_Bulk: { [model: string]: AnyBulkWriteOperation[]; } = {};

    public constructor(
        protected blukWriteOptions: BulkWriteOptions,
        protected pool: MongoPool,
    ) { }

    /**
     * 提交
     */
    public async commit() {
        try {
            const bulks = Object.entries(this.m_Bulk);
            if (!bulks.length)
                return;

            this.m_Bulk = {};

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

    public registerAdd(model: Function, entry: any) {
        this.m_Bulk[model.name] ??= [];
        this.m_Bulk[model.name].push({
            insertOne: {
                document: toDoc(entry)
            }
        });
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

    public registerRemove(model: Function, entry: any) {
        this.m_Bulk[model.name] ??= [];
        this.m_Bulk[model.name].push({
            deleteOne: {
                filter: {
                    _id: entry.id,
                }
            }
        });
    }

    public registerSave(model: Function, entry: any) {
        this.m_Bulk[model.name] ??= [];

        const doc = toDoc(entry);
        const index = this.m_Bulk[model.name].findIndex(r => {
            return (r as any).updateOne?.filter?._id == doc._id;
        });
        if (index != -1)
            this.m_Bulk[model.name].splice(index, 1);

        delete doc._id;
        this.m_Bulk[model.name].push({
            updateOne: {
                filter: {
                    _id: entry.id,
                },
                update: {
                    $set: doc,
                }
            }
        });
    }

    protected abstract commitWithSession(session: ClientSession, bulks: [string, AnyBulkWriteOperation[]][]): Promise<void>;
}