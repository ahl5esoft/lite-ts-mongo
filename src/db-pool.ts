import { Db, MongoClient } from 'mongodb';

export class DbPool {
    private m_Client: Promise<MongoClient>;
    public get client() {
        this.m_Client ??= new MongoClient(this.m_Url).connect();
        return this.m_Client;
    }

    private m_Db: Promise<Db>;
    public get db() {
        this.m_Db ??= new Promise<Db>(async (s, f) => {
            try {
                const client = await this.client;
                s(
                    client.db(this.m_Name)
                );
            } catch (ex) {
                f(ex);
            }
        })
        return this.m_Db;
    }

    /**
     * 构造函数
     * 
     * @param m_Name 数据名
     * @param m_Url 连接地址
     */
    public constructor(
        private m_Name: string,
        private m_Url: string,
    ) { }
}
