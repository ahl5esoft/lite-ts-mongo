import { CacheBase } from './cache-base';
import { Enum } from './enum';
import { IDbFactory } from './i-db-factory';
import { IEnumItem } from './i-enum-item';
import { IRedis } from './i-redis';
import { ITraceable } from './i-traceable';
import { TracerStrategy } from './tracer-strategy';

export class MongoEnumCache<T extends Enum> extends CacheBase implements ITraceable<CacheBase> {
    public static buildItemFunc: (name: string, itemEntry: any) => IEnumItem<any>;

    public constructor(
        private m_DbFactory: IDbFactory,
        private m_Model: new () => T,
        redis: IRedis,
        cacheKey: string,
    ) {
        super(redis, cacheKey);
    }

    public withTrace(parentSpan: any) {
        if (!parentSpan)
            return this;

        const self = new MongoEnumCache(
            new TracerStrategy(this.m_DbFactory).withTrace(parentSpan),
            this.m_Model,
            new TracerStrategy(this.redis).withTrace(parentSpan),
            this.cacheKey,
        );
        self.nextCheckOn = this.nextCheckOn;
        self.updateOn = this.updateOn;
        self.value = this.value;
        return self;
    }

    protected async load() {
        const entries = await this.m_DbFactory.db(this.m_Model).query().toArray();
        return entries.reduce((memo, r) => {
            memo[r.id] = r.items.reduce((memo, cr) => {
                memo[cr.value] = MongoEnumCache.buildItemFunc(r.id, cr);
                return memo;
            }, {});
            return memo;
        }, {});
    }
}