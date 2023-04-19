import { ConfigLoadHandlerBase, ConfigLoadHandlerContext } from 'lite-ts-config';
import { areaDbOption, DbFactoryBase, DbModel } from 'lite-ts-db';

import { modelDbOption } from './model-db-option';

class Config extends DbModel {
    public items: any;
}

export class MongoLoadConfigHandler extends ConfigLoadHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(ctx: ConfigLoadHandlerContext) {
        const entries = await this.m_DbFactory.db<Config>(
            modelDbOption(Config),
            areaDbOption(ctx.areaNo)
        ).query().toArray({
            where: {
                id: ctx.name,
            }
        });
        if (!entries.length)
            return;

        ctx.res = entries[0].items;
    }
}