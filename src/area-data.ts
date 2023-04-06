import { EnumItem } from 'lite-ts-enum';

export class AreaData extends EnumItem {
    /**
     * 数据库连接信息
     */
    public connectionString: {
        [app: string]: string;
    };
}