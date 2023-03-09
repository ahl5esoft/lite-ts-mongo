import { DbOption, IDbRepository, IUnitOfWork } from 'lite-ts-db';

import { DbPool } from './db-pool';
import { DbQuery } from './db-query';
import { UnitOfWorkBase } from './unit-of-work-base';

type regiterAction = (model: Function, entry: any) => void;

export function modelDbOption(model: Function): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).model = model;
    };
}

export function uowDbOption(uow: IUnitOfWork): DbOption {
    return dbRepo => {
        (dbRepo as DbRepository<any>).uow = uow as UnitOfWorkBase;
    };
}

export class DbRepository<T> implements IDbRepository<T> {
    /**
     * 是否有事务
     */
    private m_IsTx = false;
    public set uow(v: UnitOfWorkBase) {
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
     * @param m_DbFactory 数据库工厂
     * @param m_Model 模型
     */
    public constructor(
        private m_Pool: DbPool,
        private m_Uow: UnitOfWorkBase,
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
        return new DbQuery<T>(this.m_Pool, this.m_Model.name);
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
        action.bind(this.m_Uow)(this.m_Model, entry);
        if (this.m_IsTx)
            return;

        await this.m_Uow.commit();
    }
}
