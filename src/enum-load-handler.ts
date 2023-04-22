import { areaDbOption, DbFactoryBase } from 'lite-ts-db';
import { EnumLoadHandlerBase, EnumLoadHandlerContext } from 'lite-ts-enum';

import { Enum } from './enum';
import { modelDbOption } from './model-db-option';

export class MongoEnumLoadHandler extends EnumLoadHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(ctx: EnumLoadHandlerContext) {
        const entries = await this.m_DbFactory.db<Enum>(
            modelDbOption(Enum),
            areaDbOption(ctx.areaNo)
        ).query().toArray({
            where: {
                id: ctx.enum.name,
            }
        });
        if (!entries.length)
            return;

        ctx.res = entries[0].items.reduce((memo, r) => {
            memo[r.value] = r;
            return memo;
        }, {});
    }
}