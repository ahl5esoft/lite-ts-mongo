import { notStrictEqual, strictEqual } from 'assert';
import { Mock } from 'lite-ts-mock';

import { CacheBase } from './cache-base';
import { IRedis } from './i-redis';

class Self extends CacheBase {

    public constructor(
        private m_LoadFunc: () => Promise<any>,
        redis: IRedis,
        cacheKey: string
    ) {
        super(redis, cacheKey);
    }

    protected async load() {
        return this.m_LoadFunc();
    }
}

describe('src/cache-base.ts', () => {
    describe('.flush()', () => {
        it('ok', async () => {
            const redisMock = new Mock<IRedis>();
            const cacheKey = 'cache-key';
            const self = new Self(null, redisMock.actual, cacheKey);

            redisMock.expectReturn(
                r => r.hset('cache', cacheKey, Date.now().toString()),
                null
            );

            await self.flush();
        });
    });

    describe('.get<T>(key: string)', () => {
        it('ok', async () => {
            let loadCount = 0;

            const redisMock = new Mock<IRedis>();
            const cacheKey = 'cache-key';
            const self = new Self(async () => {
                loadCount++;
                return { a: 1 };
            }, redisMock.actual, cacheKey);

            redisMock.expectReturn(
                r => r.hget('cache', cacheKey),
                1
            );

            const value = await self.get<number>('a');
            strictEqual(value, 1);
            strictEqual(loadCount, 1);

            const nextCheckOn = Reflect.get(self, 'nextCheckOn');
            notStrictEqual(nextCheckOn, 0);
        });
    });
});