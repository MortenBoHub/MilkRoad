/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Category {
  /** @format int32 */
  id?: number;
  name?: string;
}

export interface CategoryRequest {
  name?: string;
}

export interface User {
  /** @format int32 */
  userId?: number;
  userName?: string;
  userProducts?: Products[];
}

export interface Products {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  userId?: number;
  productName?: string;
  /** @format decimal */
  price?: number;
  isForSale?: boolean;
  user?: User | null;
}

export interface AuthRequest {
  userName?: string;
  password?: string;
}

export interface ProductRequest {
  productName?: string;
  /** @format decimal */
  price?: number;
}

export interface BuyRequest {
  productIds?: number[];
}

export interface CreateProductRequest {
  /** @format int32 */
  userId?: number;
  productName?: string;
  /** @format decimal */
  price?: number;
}

export interface UpdateProductRequest {
  /** @format int32 */
  userId?: number;
  productName?: string;
  /** @format decimal */
  price?: number;
}

export interface AdminDeleteUserParams {
  /** @format int32 */
  id: number;
}

export interface AdminGetCategoryByIdParams {
  /** @format int32 */
  id: number;
}

export interface AdminUpdateCategoryParams {
  /** @format int32 */
  id: number;
}

export interface AdminDeleteCategoryParams {
  /** @format int32 */
  id: number;
}

export interface BaseUserGetProductParams {
  /** @format int32 */
  userId?: number;
}

export interface BaseUserAddProductParams {
  /** @format int32 */
  userId?: number;
}

export interface BaseUserDeleteProductParams {
  /** @format int32 */
  userId?: number;
  /** @format int32 */
  productId?: number;
}

export interface BaseUserSellParams {
  /** @format int32 */
  userId?: number;
  /** @format int32 */
  productId?: number;
}

export interface BaseUserBuyParams {
  /** @format int32 */
  buyerId?: number;
}

export interface ProductGetByIdParams {
  /** @format int32 */
  id: number;
}

export interface ProductUpdateParams {
  /** @format int32 */
  id: number;
}

export interface ProductDeleteParams {
  /**
   * @format int32
   * @min 1
   * @max 2147483647
   */
  userId?: number;
  /** @format int32 */
  id: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:5001";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data.data;
    });
  };
}

/**
 * @title My Title
 * @version 1.0.0
 * @baseUrl http://localhost:5001
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Admin
     * @name AdminDeleteUser
     * @request DELETE:/api/admin/users/{id}
     */
    adminDeleteUser: (
      { id }: AdminDeleteUserParams,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/admin/users/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin
     * @name AdminGetAllCategories
     * @request GET:/api/admin/categories
     */
    adminGetAllCategories: (params: RequestParams = {}) =>
      this.request<Category[], any>({
        path: `/api/admin/categories`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin
     * @name AdminCreateCategory
     * @request POST:/api/admin/categories
     */
    adminCreateCategory: (data: CategoryRequest, params: RequestParams = {}) =>
      this.request<Category, any>({
        path: `/api/admin/categories`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin
     * @name AdminGetCategoryById
     * @request GET:/api/admin/categories/{id}
     */
    adminGetCategoryById: (
      { id }: AdminGetCategoryByIdParams,
      params: RequestParams = {},
    ) =>
      this.request<Category, any>({
        path: `/api/admin/categories/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin
     * @name AdminUpdateCategory
     * @request PUT:/api/admin/categories/{id}
     */
    adminUpdateCategory: (
      { id }: AdminUpdateCategoryParams,
      data: CategoryRequest,
      params: RequestParams = {},
    ) =>
      this.request<Category, any>({
        path: `/api/admin/categories/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Admin
     * @name AdminDeleteCategory
     * @request DELETE:/api/admin/categories/{id}
     */
    adminDeleteCategory: (
      { id }: AdminDeleteCategoryParams,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/admin/categories/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserRegister
     * @request POST:/api/users-actions/Register
     */
    baseUserRegister: (data: AuthRequest, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/users-actions/Register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserLogin
     * @request POST:/api/users-actions/Login
     */
    baseUserLogin: (data: AuthRequest, params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/api/users-actions/Login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserGetProduct
     * @request GET:/api/users-actions/GetProduct
     */
    baseUserGetProduct: (
      query: BaseUserGetProductParams = {},
      data: ProductRequest,
      params: RequestParams = {},
    ) =>
      this.request<Products, any>({
        path: `/api/users-actions/GetProduct`,
        method: "GET",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserAddProduct
     * @request POST:/api/users-actions/AddProduct
     */
    baseUserAddProduct: (
      query: BaseUserAddProductParams = {},
      data: ProductRequest,
      params: RequestParams = {},
    ) =>
      this.request<Products, any>({
        path: `/api/users-actions/AddProduct`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserDeleteProduct
     * @request DELETE:/api/users-actions/DeleteProduct
     */
    baseUserDeleteProduct: (
      query: BaseUserDeleteProductParams = {},
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/users-actions/DeleteProduct`,
        method: "DELETE",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserSell
     * @request POST:/api/users-actions/Sell
     */
    baseUserSell: (
      query: BaseUserSellParams = {},
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/users-actions/Sell`,
        method: "POST",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags BaseUser
     * @name BaseUserBuy
     * @request POST:/api/users-actions/Buy
     */
    baseUserBuy: (
      query: BaseUserBuyParams = {},
      data: BuyRequest,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/users-actions/Buy`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Product
     * @name ProductGetAll
     * @request GET:/api/Product
     */
    productGetAll: (params: RequestParams = {}) =>
      this.request<Products[], any>({
        path: `/api/Product`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Product
     * @name ProductCreate
     * @request POST:/api/Product
     */
    productCreate: (data: CreateProductRequest, params: RequestParams = {}) =>
      this.request<Products, any>({
        path: `/api/Product`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Product
     * @name ProductGetById
     * @request GET:/api/Product/{id}
     */
    productGetById: (
      { id }: ProductGetByIdParams,
      params: RequestParams = {},
    ) =>
      this.request<Products, any>({
        path: `/api/Product/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Product
     * @name ProductUpdate
     * @request PUT:/api/Product/{id}
     */
    productUpdate: (
      { id }: ProductUpdateParams,
      data: UpdateProductRequest,
      params: RequestParams = {},
    ) =>
      this.request<Products, any>({
        path: `/api/Product/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Product
     * @name ProductDelete
     * @request DELETE:/api/Product/{id}
     */
    productDelete: (
      { id, ...query }: ProductDeleteParams,
      params: RequestParams = {},
    ) =>
      this.request<Blob, any>({
        path: `/api/Product/${id}`,
        method: "DELETE",
        query: query,
        ...params,
      }),
  };
}
