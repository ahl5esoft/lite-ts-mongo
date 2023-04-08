import { StringGeneratorBase } from 'lite-ts-math';
import { ObjectId } from 'mongodb';

export class MongoStringGenerator extends StringGeneratorBase {
    public async generate() {
        return new ObjectId().toHexString();
    }
}