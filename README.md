![Version](https://img.shields.io/badge/version-1.1.0-green.svg)

支持 mongo 4.x 以上版本

## 安装

```
npm install lite-ts-mongo
```

### Node.js 支持

Node.js 需要 `v14` 版本以上

## 使用

```typescript
import { MongoDbFactory, modelDbOption } from 'lite-ts-mongo';

class TestModel {
    public id: string;
    public name: string;
}

async function main() {
    const dbFactory = new MongoDbFactory(false, 'project-name', 'mongodb://localhost:27017');

    // 添加数据
    await dbFactory.db<TestModel>(modelDbOption(TestModel)).add({
        id: 'id-1',
        name: 'name 1'
    });

    // 更新数据
    await dbFactory.db<TestModel>(modelDbOption(TestModel)).save({
        id: 'id-1',
        name: 'name 1 save'
    });

    // 删除数据
    await dbFactory.db<TestModel>(modelDbOption(TestModel)).remove({
        id: 'id-1',
    } as TestModel);

    // 查询数据
    await dbFactory.db<TestModel>(modelDbOption(TestModel)).query().toArray({
        where: {
            name: 'name 1'
        },
        order: ['id'], // 根据 id 正序
        orderByDesc: ['id'], // 根据 id 倒序
        skip: 0, // 跳过多少条数据, 默认为 0 
        take: 100, // 获取多少条数据, 默认为 elasticsearch 的默认值
    });
}
```

### 多区服使用
```typescript
import { MongoAreaDbFactory, MongoDbFactory, modelDbOption, areaDbOption, AreaData } from 'lite-ts-mongo';
import { DbModel } from 'lite-ts-db';

class TestModel extends DbModel {}

async function main() {
    const globalDbFactory = new MongoDbFactory(false, 'project-name', 'mongodb://localhost:27017');

    const enumFactory = {
        build(ctor: new () => AreaData) {
            return {
                items() {
                    return Promise.resolve([
                        {
                            value: 1,
                            connectionString: {
                                'project-name': 'mongodb://10.10.0.66:27017'
                            }
                        }
                    ]);
                }
            };
        }
    };
    const dbFactory = new MongoAreaDbFactory(globalDbFactory, enumFactory, 'project-name');

    const db = dbFactory.db<TestModel>(modelDbOption(TestModel), areaDbOption(1));
    await db.add({
        id: '1'
    });

    await db.remove({
        id: '1'
    } as any);
}
```
