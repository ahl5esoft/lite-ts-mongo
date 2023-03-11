import { DbFactoryBase, DbModel, DbOption, IDbRepository, IUnitOfWork } from 'lite-ts-db';

import { MongoAreaDbFactory } from './area-db-factory';
import { AreaDbQuery } from './area-db-query';
import { MongoDbFactory } from './db-factory';
import { DbQuery } from './db-query';
import { IUnitOfWorkRepository } from './i-unit-of-work-repository';

type regiterAction = (model: Function, entry: any) => void;

export function areaDbOption(areaNo: number): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).areaNo = areaNo;
    };
}

export function modelDbOption(model: Function): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).model = model;
    };
}

export function uowDbOption(uow: IUnitOfWork): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).uow = uow as any as IUnitOfWorkRepository;
    };
}

export class DbRepository<T extends DbModel> implements IDbRepository<T> {
    /**
     * 区服
     */
    private m_AreaNo: number;
    public set areaNo(v: number) {
        this.m_AreaNo = v;
    }

    /**
     * 是否有事务
     */
    private m_IsTx = false;
    public set uow(v: IUnitOfWorkRepository) {
        this.m_IsTx = true;
        this.m_Uow = v;
    }

    /**
     * 模型
     */
    private m_Model: Function;
    public set model(v: Function) {
        this.m_Model = v;
    }

    /**
     * 构造函数
     * 
     * @param m_Pool 数据池
     * @param m_Uow 工作单元仓储
     */
    public constructor(
        private m_DbFactory: DbFactoryBase,
        private m_DbOptions: DbOption[],
        private m_Uow: IUnitOfWorkRepository,
    ) { }

    /**
     * 新增
     * 
     * @param entry 实体
     */
    public async add(entry: T) {
        await this.exec(this.m_Uow.registerAdd, entry);
    }

    /**
     * 创建表查询对象
     */
    public query() {
        const dbFactory = this.m_DbFactory as MongoAreaDbFactory;
        if (this.m_AreaNo && dbFactory.getAreaDbFactory) {
            return new AreaDbQuery<T>(
                this.m_AreaNo,
                dbFactory,
                this.m_DbOptions
            );
        }

        return new DbQuery<T>(
            (this.m_DbFactory as MongoDbFactory).pool,
            this.m_Model.name
        );
    }

    /**
     * 删除
     * 
     * @param entry 实体
     */
    public async remove(entry: T) {
        await this.exec(this.m_Uow.registerRemove, entry);
    }

    /**
     * 更新
     * 
     * @param entry 实体
     */
    public async save(entry: T) {
        await this.exec(this.m_Uow.registerSave, entry);
    }

    /**
     * 执行方法, 如果不存在事务则直接提交
     * 
     * @param action 方法
     * @param entry 实体
     */
    private async exec(action: regiterAction, entry: any) {
        if (this.m_AreaNo) {
            entry = {
                entry: entry,
                areaNo: this.m_AreaNo
            };
        }
        action.bind(this.m_Uow)(this.m_Model, entry);
        if (this.m_IsTx)
            return;

        await this.m_Uow.commit();
    }
}
