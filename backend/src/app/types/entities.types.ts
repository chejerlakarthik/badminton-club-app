export type APIResponse<T = any>  = {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Methods': string;
        'Access-Control-Allow-Headers': string;
    };
    body: string;
}

export type User = {
    userId: string
    firstName: string
    lastName: string
    email: string
    phone: string
}