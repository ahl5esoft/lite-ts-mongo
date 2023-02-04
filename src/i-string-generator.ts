/**
 * 字符串生成器
 */
export interface IStringGenerator {
    /**
     * 生成
     */
    generate(): Promise<string>;
}
