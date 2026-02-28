/**
 * Standardized API response format
 */
export interface ApiResponse<T = any> {
    data: T | null;
    error: {
        message: string;
        code?: string;
        details?: any;
    } | null;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        [key: string]: any;
    };
}

export const createSuccessResponse = <T>(data: T, meta?: any): ApiResponse<T> => {
    return {
        data,
        error: null,
        meta,
    };
};

export const createErrorResponse = (message: string, code?: string, details?: any): ApiResponse<null> => {
    return {
        data: null,
        error: {
            message,
            code,
            details,
        },
    };
};
