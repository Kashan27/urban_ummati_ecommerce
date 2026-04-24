import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminStats, CheckFreeProductBody, CreateFreeProductLinkBody, CreateOrderBody, CreateProductBody, DeleteProduct200, Error, FreeProductEligibility, FreeProductLink, GetFeaturedProducts200, GetUpsellProducts200, GetUpsellProductsParams, HealthStatus, ListOrders200, ListOrdersParams, ListProducts200, ListProductsParams, Order, Product, UpdateOrderStatusBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all products
 */
export declare const getListProductsUrl: (params?: ListProductsParams) => string;
export declare const listProducts: (params?: ListProductsParams, options?: RequestInit) => Promise<ListProducts200>;
export declare const getListProductsQueryKey: (params?: ListProductsParams) => readonly ["/api/products", ...ListProductsParams[]];
export declare const getListProductsQueryOptions: <TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProductsQueryResult = NonNullable<Awaited<ReturnType<typeof listProducts>>>;
export type ListProductsQueryError = ErrorType<unknown>;
/**
 * @summary List all products
 */
export declare function useListProducts<TData = Awaited<ReturnType<typeof listProducts>>, TError = ErrorType<unknown>>(params?: ListProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get featured/bestseller products
 */
export declare const getGetFeaturedProductsUrl: () => string;
export declare const getFeaturedProducts: (options?: RequestInit) => Promise<GetFeaturedProducts200>;
export declare const getGetFeaturedProductsQueryKey: () => readonly ["/api/products/featured"];
export declare const getGetFeaturedProductsQueryOptions: <TData = Awaited<ReturnType<typeof getFeaturedProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFeaturedProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getFeaturedProducts>>>;
export type GetFeaturedProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get featured/bestseller products
 */
export declare function useGetFeaturedProducts<TData = Awaited<ReturnType<typeof getFeaturedProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get upsell product recommendations
 */
export declare const getGetUpsellProductsUrl: (params?: GetUpsellProductsParams) => string;
export declare const getUpsellProducts: (params?: GetUpsellProductsParams, options?: RequestInit) => Promise<GetUpsellProducts200>;
export declare const getGetUpsellProductsQueryKey: (params?: GetUpsellProductsParams) => readonly ["/api/products/upsell", ...GetUpsellProductsParams[]];
export declare const getGetUpsellProductsQueryOptions: <TData = Awaited<ReturnType<typeof getUpsellProducts>>, TError = ErrorType<unknown>>(params?: GetUpsellProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUpsellProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUpsellProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUpsellProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getUpsellProducts>>>;
export type GetUpsellProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get upsell product recommendations
 */
export declare function useGetUpsellProducts<TData = Awaited<ReturnType<typeof getUpsellProducts>>, TError = ErrorType<unknown>>(params?: GetUpsellProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUpsellProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a single product
 */
export declare const getGetProductUrl: (id: number) => string;
export declare const getProduct: (id: number, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (id: number) => readonly [`/api/products/${number}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<Error>;
/**
 * @summary Get a single product
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all orders (admin)
 */
export declare const getListOrdersUrl: (params?: ListOrdersParams) => string;
export declare const listOrders: (params?: ListOrdersParams, options?: RequestInit) => Promise<ListOrders200>;
export declare const getListOrdersQueryKey: (params?: ListOrdersParams) => readonly ["/api/orders", ...ListOrdersParams[]];
export declare const getListOrdersQueryOptions: <TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof listOrders>>>;
export type ListOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List all orders (admin)
 */
export declare function useListOrders<TData = Awaited<ReturnType<typeof listOrders>>, TError = ErrorType<unknown>>(params?: ListOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new order
 */
export declare const getCreateOrderUrl: () => string;
export declare const createOrder: (createOrderBody: CreateOrderBody, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<CreateOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<CreateOrderBody>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<CreateOrderBody>;
export type CreateOrderMutationError = ErrorType<Error>;
/**
 * @summary Create a new order
 */
export declare const useCreateOrder: <TError = ErrorType<Error>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<CreateOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<CreateOrderBody>;
}, TContext>;
/**
 * @summary Get order details
 */
export declare const getGetOrderUrl: (id: number) => string;
export declare const getOrder: (id: number, options?: RequestInit) => Promise<Order>;
export declare const getGetOrderQueryKey: (id: number) => readonly [`/api/orders/${number}`];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
export type GetOrderQueryError = ErrorType<Error>;
/**
 * @summary Get order details
 */
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<Error>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update order status
 */
export declare const getUpdateOrderStatusUrl: (id: number) => string;
export declare const updateOrderStatus: (id: number, updateOrderStatusBody: UpdateOrderStatusBody, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<UpdateOrderStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<UpdateOrderStatusBody>;
}, TContext>;
export type UpdateOrderStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrderStatus>>>;
export type UpdateOrderStatusMutationBody = BodyType<UpdateOrderStatusBody>;
export type UpdateOrderStatusMutationError = ErrorType<unknown>;
/**
 * @summary Update order status
 */
export declare const useUpdateOrderStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<UpdateOrderStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<UpdateOrderStatusBody>;
}, TContext>;
/**
 * @summary Check if email is eligible for free product
 */
export declare const getCheckFreeProductUrl: () => string;
export declare const checkFreeProduct: (checkFreeProductBody: CheckFreeProductBody, options?: RequestInit) => Promise<FreeProductEligibility>;
export declare const getCheckFreeProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkFreeProduct>>, TError, {
        data: BodyType<CheckFreeProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkFreeProduct>>, TError, {
    data: BodyType<CheckFreeProductBody>;
}, TContext>;
export type CheckFreeProductMutationResult = NonNullable<Awaited<ReturnType<typeof checkFreeProduct>>>;
export type CheckFreeProductMutationBody = BodyType<CheckFreeProductBody>;
export type CheckFreeProductMutationError = ErrorType<unknown>;
/**
 * @summary Check if email is eligible for free product
 */
export declare const useCheckFreeProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkFreeProduct>>, TError, {
        data: BodyType<CheckFreeProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkFreeProduct>>, TError, {
    data: BodyType<CheckFreeProductBody>;
}, TContext>;
/**
 * @summary Generate a free product link (admin)
 */
export declare const getCreateFreeProductLinkUrl: () => string;
export declare const createFreeProductLink: (createFreeProductLinkBody: CreateFreeProductLinkBody, options?: RequestInit) => Promise<FreeProductLink>;
export declare const getCreateFreeProductLinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFreeProductLink>>, TError, {
        data: BodyType<CreateFreeProductLinkBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFreeProductLink>>, TError, {
    data: BodyType<CreateFreeProductLinkBody>;
}, TContext>;
export type CreateFreeProductLinkMutationResult = NonNullable<Awaited<ReturnType<typeof createFreeProductLink>>>;
export type CreateFreeProductLinkMutationBody = BodyType<CreateFreeProductLinkBody>;
export type CreateFreeProductLinkMutationError = ErrorType<unknown>;
/**
 * @summary Generate a free product link (admin)
 */
export declare const useCreateFreeProductLink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFreeProductLink>>, TError, {
        data: BodyType<CreateFreeProductLinkBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFreeProductLink>>, TError, {
    data: BodyType<CreateFreeProductLinkBody>;
}, TContext>;
/**
 * @summary Validate and get a free product link
 */
export declare const getGetFreeProductLinkUrl: (token: string) => string;
export declare const getFreeProductLink: (token: string, options?: RequestInit) => Promise<FreeProductLink>;
export declare const getGetFreeProductLinkQueryKey: (token: string) => readonly [`/api/promo/free-product-link/${string}`];
export declare const getGetFreeProductLinkQueryOptions: <TData = Awaited<ReturnType<typeof getFreeProductLink>>, TError = ErrorType<Error>>(token: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFreeProductLink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFreeProductLink>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFreeProductLinkQueryResult = NonNullable<Awaited<ReturnType<typeof getFreeProductLink>>>;
export type GetFreeProductLinkQueryError = ErrorType<Error>;
/**
 * @summary Validate and get a free product link
 */
export declare function useGetFreeProductLink<TData = Awaited<ReturnType<typeof getFreeProductLink>>, TError = ErrorType<Error>>(token: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFreeProductLink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new product
 */
export declare const getCreateProductUrl: () => string;
export declare const createProduct: (createProductBody: CreateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<CreateProductBody>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
 * @summary Create a new product
 */
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<CreateProductBody>;
}, TContext>;
/**
 * @summary Update a product
 */
export declare const getUpdateProductUrl: (id: number) => string;
export declare const updateProduct: (id: number, createProductBody: CreateProductBody, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<CreateProductBody>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<CreateProductBody>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
 * @summary Update a product
 */
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<CreateProductBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<CreateProductBody>;
}, TContext>;
/**
 * @summary Delete a product
 */
export declare const getDeleteProductUrl: (id: number) => string;
export declare const deleteProduct: (id: number, options?: RequestInit) => Promise<DeleteProduct200>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
/**
 * @summary Delete a product
 */
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get admin dashboard stats
 */
export declare const getGetAdminStatsUrl: () => string;
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map