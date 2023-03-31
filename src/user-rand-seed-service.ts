import { areaDbOption, DbFactoryBase, DbModel, IRandSeedService, IUnitOfWork, uowDbOption } from 'lite-ts-db';

import { modelDbOption } from './model-db-option';

export class UserRandSeed extends DbModel {
    public seed: { [scene: string]: string; };
}

export class MongoUserRandSeedService implements IRandSeedService {
    private m_Entry: Promise<UserRandSeed>;

    public constructor(
        private m_AreaNo: number,
        private m_DbFactory: DbFactoryBase,
        private m_Range: [number, number],
        private m_Scene: string,
        private m_UserID: string
    ) { }

    public async get(uow: IUnitOfWork, len: number, offset?: number) {
        const seeds = await this.findSeeds(uow);
        offset ??= 0;
        if (len + offset >= seeds.length)
            throw new Error('种子已达最大值');

        return parseInt(
            seeds.splice(offset, len).join('')
        ) || 0;
    }

    public async use(uow: IUnitOfWork, len: number) {
        const seeds = await this.findSeeds(uow);
        if (len >= seeds.length)
            throw new Error('种子已达最大值');

        const seed = parseInt(
            seeds.splice(0, len).join('')
        ) || 0;

        const entry = await this.getEntry(uow);
        entry.seed[this.m_Scene] = seeds.join('');
        await this.m_DbFactory.db<UserRandSeed>(
            modelDbOption(UserRandSeed),
            uowDbOption(uow),
            areaDbOption(this.m_AreaNo)
        ).save(entry);
        return seed;
    }

    private async findSeeds(uow: IUnitOfWork) {
        const entry = await this.getEntry(uow);

        entry.seed[this.m_Scene] ??= '';
        if (entry.seed[this.m_Scene].length < this.m_Range[0]) {
            while (entry.seed[this.m_Scene].length < this.m_Range[1])
                entry.seed[this.m_Scene] += Math.random().toString(10).substring(2);

            await this.m_DbFactory.db<UserRandSeed>(
                modelDbOption(global.UserRandSeed),
                uowDbOption(uow),
                areaDbOption(this.m_AreaNo)
            ).save(entry);
        }

        return [...entry.seed[this.m_Scene]];
    }

    private getEntry(uow: IUnitOfWork) {
        this.m_Entry ??= new Promise<UserRandSeed>(async (s, f) => {
            try {
                const db = this.m_DbFactory.db<UserRandSeed>(
                    modelDbOption(global.UserRandSeed),
                    uowDbOption(uow),
                    areaDbOption(this.m_AreaNo)
                );
                const entries = await db.query().toArray({
                    where: {
                        id: this.m_UserID
                    }
                });
                if (!entries.length) {
                    entries.push({
                        id: this.m_UserID,
                        seed: {}
                    });
                    await db.add(entries[0]);
                }
                s(entries[0]);
            } catch (ex) {
                f(ex);
            }
        });
        return this.m_Entry;
    }
}