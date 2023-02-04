import { ObjectId } from 'mongodb';

import { IStringGenerator } from './i-string-generator';

/**
 * mongo字符串生成器
 */
export class MongoStringGenerator implements IStringGenerator {
    /**
     * 生成ID
     */
    public async generate() {
        return new ObjectId().toHexString();
    }
}