import { EnumItemData } from './enum-item-data';

export interface IEnumItem<T extends EnumItemData> {
    readonly entry: T;
    readonly langKey: string;
    getCustomLangKey(attr: string): string;
}