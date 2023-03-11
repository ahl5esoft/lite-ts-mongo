import { DbModel } from 'lite-ts-db';

export class AreaDbModel {
    public areaNo: number;
    public entry: DbModel;

    public get id() {
        return this.entry?.id;
    }

    public constructor(v?: AreaDbModel) {
        if (v)
            Object.assign(this, v);
    }
}