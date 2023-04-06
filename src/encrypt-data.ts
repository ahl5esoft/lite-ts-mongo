import { EnumItem } from 'lite-ts-enum';

import { EncryptAlgorithmType } from './encrypt-algorithm-type';

export class EncryptData extends EnumItem {
    /**
     * 密钥
     */
    public key: string;
    /**
     * 算法
     */
    public algorithm: EncryptAlgorithmType;
}