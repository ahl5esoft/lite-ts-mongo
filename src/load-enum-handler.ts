import { areaDbOption, DbFactoryBase } from 'lite-ts-db';
import { LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';

import { Enum } from './enum';
import { modelDbOption } from './model-db-option';

export class LoadMongoEnumHandler extends LoadEnumHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(opt: LoadEnumHandleOption) {
        const entries = await this.m_DbFactory.db<Enum>(
            modelDbOption(Enum),
            areaDbOption(opt.areaNo)
        ).query().toArray({
            where: {
                id: opt.enum.name,
            }
        });
        if (!entries.length)
            return;

        opt.res = entries[0].items.reduce((memo, r) => {
            memo[r.value] = r;
            return memo;
        }, {});
    }
}