import { areaDbOption, DbFactoryBase } from 'lite-ts-db';
import { LoadEnumHandlerBase, LoadEnumHandlerContext } from 'lite-ts-enum';

import { Enum } from './enum';
import { modelDbOption } from './model-db-option';

export class MongoLoadEnumHandler extends LoadEnumHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(ctx: LoadEnumHandlerContext) {
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