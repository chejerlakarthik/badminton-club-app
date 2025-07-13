export declare const TABLE_NAME: string;
export declare class DatabaseService {
    static get(PK: string, SK: string): Promise<Record<string, any> | undefined>;
    static put(item: any): Promise<any>;
    static update(PK: string, SK: string, updates: any): Promise<Record<string, any> | undefined>;
    static delete(PK: string, SK: string): Promise<void>;
    static query(PK: string, SK?: string, indexName?: string): Promise<Record<string, any>[]>;
    static queryGSI(gsiPK: string, gsiSK?: string, indexName?: string): Promise<Record<string, any>[]>;
    static scan(filterExpression?: string, expressionAttributeValues?: any): Promise<Record<string, any>[]>;
}
//# sourceMappingURL=database.d.ts.map