import { DbFactoryBase } from 'lite-ts-db';
import { Enum as Enumerator, EnumItem, LoadHandlerBase } from 'lite-ts-enum';

import { modelDbOption } from './db-repository';

export class Enum {
    public id: string;
    public items: EnumItem[];
}

export class LoadMongoEnumHandler extends LoadHandlerBase {
    public constructor(
        private m_DbFactory: DbFactoryBase,
    ) {
        super();
    }

    public async handle(enumerator: Enumerator<any>, res: { [no: number]: any; }) {
        const entries = await this.m_DbFactory.db<Enum>(
            modelDbOption(Enum)
        ).query().toArray({
            where: {
                id: enumerator.name,
            }
        });
        if (!entries.length)
            return;

        Object.keys(res).forEach(r => {
            delete res[r];
        });

        entries[0].items.forEach(r => {
            res[r.value] = r;
        });
    }
}