import { DbModel } from 'lite-ts-db';

/**
 * 用户随机种子
 */
export class UserRandSeed extends DbModel {
    /**
     * 种子, { 场景: 种子 }
     */
    public seed: { [scene: string]: string; };
}