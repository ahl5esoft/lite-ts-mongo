import { DbFactoryBase } from 'lite-ts-db';
import { EnumItem, LoadEnumHandleOption, LoadEnumHandlerBase } from 'lite-ts-enum';

import { modelDbOption } from './model-db-option';

export class Enum {
    public id: string;
    public items: EnumItem[];
}

export class LoadMongoEnumHandler extends LoadEnumHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(opt: LoadEnumHandleOption) {
        const entries = await this.m_DbFactory.db<Enum>(
            modelDbOption(Enum)
        ).query().toArray({
            where: {
                id: opt.enum.name,
            }
        });
        if (!entries.length)
            return;

        Object.keys(opt.res).forEach(r => {
            delete opt.res[r];
        });

        entries[0].items.forEach(r => {
            opt.res[r.value] = r;
        });
    }
}