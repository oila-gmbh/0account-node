import {Result} from "./interfaces";

const authHeaders = ["x-0account-auth", "X-0account-Auth", "X-0account-AUTH"]
const uuidHeaders = ["x-0account-uuid", "X-0account-Uuid", "X-0account-UUID"]

export const getAuthHeader = (headers: any) => {
    return getFromHeader(authHeaders, headers)
}

export const getUUIDHeader = (headers: any) => {
    return getFromHeader(uuidHeaders, headers)
}


export const getFromHeader = (headerNames: string[], headers: any): string | undefined => {
    for (const headerName of headerNames) {
        const header = getFromHeaders(headerName, headers);
        if (header) return header;
    }
    return undefined;
}

export const getFromHeaders = (headerName: string, headers: any): string | undefined => {
    if (headers[headerName]) return headers[headerName];
    if (headers.header) return headers.header(headerName);
    if (headers.get) return headers.get(headerName);
    if (headers.getHeader) return headers.getHeader(headerName);

    const lowerCaseHeaderName = headerName.toLowerCase();

    for (const key in headers) {
        if (key.toLowerCase() === lowerCaseHeaderName) {
            if (headers[key]) return headers[key];
        }
    }
    return undefined;
}

export const constructResult = (body: any, isWebhookRequest: boolean): Result => {
    const {data, metadata: meta} = body
    return {
        data,
        metadata: {
            userId: meta.userId,
            profileId: meta.profileId,
            isWebhookRequest,
        }
    }
}
