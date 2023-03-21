import { areaDbOption, DbFactoryBase, DbModel } from 'lite-ts-db';
import { LoadConfigHandleOption, LoadConfigHandlerBase } from 'lite-ts-config';

import { modelDbOption } from './model-db-option';

class Config extends DbModel {
    public items: any;
}

export class LoadMongoConfigHandler extends LoadConfigHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(opt: LoadConfigHandleOption) {
        const entries = await this.m_DbFactory.db<Config>(
            modelDbOption(Config),
            areaDbOption(opt.areaNo)
        ).query().toArray({
            where: {
                id: opt.name,
            }
        });
        if (!entries.length)
            return;

        opt.res = entries[0].items;
    }
}