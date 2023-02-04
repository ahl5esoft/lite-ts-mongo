import { CacheBase } from './cache-base';
import { Config } from './config';
import { IDbFactory } from './i-db-factory';
import { IRedis } from './i-redis';
import { ITraceable } from './i-traceable';
import { TracerStrategy } from './tracer-strategy';

export class MongoConfigCache<T extends Config> extends CacheBase implements ITraceable<CacheBase> {
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

        const self = new MongoConfigCache(
            new TracerStrategy(this.m_DbFactory).withTrace(parentSpan),
            this.m_Model,
            new TracerStrategy(this.redis).withTrace(parentSpan),
            this.cacheKey
        );
        self.nextCheckOn = this.nextCheckOn;
        self.updateOn = this.updateOn;
        self.value = this.value;
        return self;
    }

    protected async load() {
        const entries = await this.m_DbFactory.db(this.m_Model).query().toArray();
        return entries.reduce((memo, r) => {
            memo[r.id] = r.items;
            return memo;
        }, {});
    }
}