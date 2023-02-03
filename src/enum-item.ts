import { EnumItemData } from './enum-item-data';
import { IEnumItem } from './i-enum-item';

export class EnumItem<T extends EnumItemData> implements IEnumItem<T> {
    private m_LangKey: string;
    public get langKey() {
        return this.m_LangKey;
    }

    public constructor(
        public entry: T,
        private m_Name: string,
    ) {
        this.m_LangKey = this.join(this.m_Name, entry.value);
    }

    public getCustomLangKey(attr: string) {
        return this.join(this.m_Name, this.entry.value, attr);
    }

    private join(...keys: any[]) {
        return keys.join('-');
    }
}