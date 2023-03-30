import { areaDbOption, DbFactoryBase } from 'lite-ts-db';
import { EnumItem } from 'lite-ts-enum';
import { RedisBase } from 'lite-ts-redis';

import { modelDbOption } from './model-db-option';

export class Enum {
    public id: string;
    public items: EnumItem[];
}

export class MongoEnum<T extends EnumItem> {
    public constructor(
        public name: string,
        private m_AreaNo: number,
        private m_DbFactory: DbFactoryBase,
        private m_Redis: RedisBase
    ) { }

    public async save(items: T[], backupExpire?: number) {
        if (backupExpire) {
            await this.m_Redis.set(
                `Enum:Backup:${this.name}`,
                JSON.stringify(items),
                'EX',
                backupExpire
            );
        }
        const db = this.m_DbFactory.db<Enum>(
            modelDbOption(Enum),
            areaDbOption(this.m_AreaNo),
        );
        const entries = await db.query().toArray({
            where: {
                id: this.name
            }
        });
        if (entries.length) {
            entries[0].items = items;
            await db.save(entries[0]);
        } else {
            await db.add({
                id: this.name,
                items: items,
            });
        }
    }
}