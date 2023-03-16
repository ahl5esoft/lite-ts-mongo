import { AreaDbModel, DbFactoryBase, IUnitOfWorkRepository } from 'lite-ts-db';

import { MongoAreaDbFactory } from './area-db-factory';

type opAction = (uow: IUnitOfWorkRepository) => void;

export class AreaUnitOfWork implements IUnitOfWorkRepository {
    /**
     * 提交后函数
     */
    private m_AfterAction: { [key: string]: () => Promise<void>; } = {};

    private m_Bulk: {
        [no: number]: opAction[];
    } = {};

    public constructor(
        private m_DbFactory: MongoAreaDbFactory,
        private m_GlobalDbFactory: DbFactoryBase,
    ) { }

    public async commit() {
        try {
            const entries = Object.entries(this.m_Bulk);
            this.m_Bulk = {};
            for (const [areaNo, opActions] of entries) {
                let uow: IUnitOfWorkRepository;

                if (areaNo) {
                    const dbFactory = await this.m_DbFactory.getAreaDbFactory(Number(areaNo));
                    uow = dbFactory.uow() as IUnitOfWorkRepository;
                } else {
                    uow = this.m_GlobalDbFactory.uow() as IUnitOfWorkRepository;
                }

                for (const r of opActions)
                    r(uow);

                await uow.commit();
            }
        } finally {
            const tasks = Object.values(this.m_AfterAction).map(r => {
                return r();
            });
            await Promise.all(tasks);
        }
    }

    public registerAdd(model: string, entry: AreaDbModel) {
        entry.areaNo ??= 0;
        this.m_Bulk[entry.areaNo] ??= [];
        this.m_Bulk[entry.areaNo].push((uow: IUnitOfWorkRepository) => {
            uow.registerAdd(model, entry.areaNo ? entry.entry : entry);
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

    public registerRemove(model: string, entry: AreaDbModel) {
        entry.areaNo ??= 0;
        this.m_Bulk[entry.areaNo] ??= [];
        this.m_Bulk[entry.areaNo].push((uow: IUnitOfWorkRepository) => {
            uow.registerRemove(model, entry.areaNo ? entry.entry : entry);
        });
    }

    public registerSave(model: string, entry: AreaDbModel) {
        entry.areaNo ??= 0;
        this.m_Bulk[entry.areaNo] ??= [];
        this.m_Bulk[entry.areaNo].push((uow: IUnitOfWorkRepository) => {
            uow.registerSave(model, entry.areaNo ? entry.entry : entry);
        });
    }
}
