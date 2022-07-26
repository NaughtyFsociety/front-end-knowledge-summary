import { Injectable } from '@angular/core';
import {
    HttpClient, HttpHeaders, HttpResponse as HttpClientResponse, HttpErrorResponse
} from '@angular/common/http';
import { Observable, TimeoutError, Subscriber, Subscription, throwError, of } from 'rxjs';
import { map, timeout, finalize, catchError } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { ERROR_OK, CORE_CONFIG } from '../constants';
import { I18nService } from './i18n.service';
import { result } from 'lodash';
import { CookieService } from './cookie.service';
import { LogService } from './log.service';
import { Rest } from '../models/rest';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * http请求选项
 */
export interface BaseRequestOptionsArgs {
    /**
     * 请求URL
     */
    url?: string;
    /**
     * 请求头
     */
    headers?: HttpHeaders;
    /**
     * URL参数
     */
    params?: {
        [param: string]: any;
    };
    /**
     * 是否报告进度。上传文件时需要
     */
    reportProgress?: boolean;
    /**
     * 请求体内容
     */
    body?: any;
    /**
     * 请求是否显示遮罩
     */
    mask?: boolean;
    /**
     * 请求超时时间
     */
    timeout?: number;
    /**
     * 请求是否走异常分支的判断条件
     */
    isException?: (res: HttpResponse) => boolean;
    /**
     * 是否处理异常提示
     */
    doException?: boolean;
    /**
     * 是否处理成功提示
     */
    doSuccess?: boolean;
    /**
     * 请求名称，比如创建存储池StoragePool001
     */
    name?: string;
    /**
     * rest名称的参数列表。比如rest的name为创建存储池 {0}，这里restNameParams可以出传['StoragePool001']
     */
    restNameParams?: any[];
    /**
     * 请求方法
     */
    method?: HttpMethod;
    /**
     * 适配请求结果，用于归一化返回的结果
     */
    adaptResult?: (res: any, rest: Rest, options: BaseRequestOptionsArgs) => BaseHttpResponse;
    /**
     * 是否跳过没有权限的提示信息，默认为true
     */
    skipNoPermissionException?: boolean;
    /**
     * 执行结果成功是否显示详情标识，默认不显示
     */
    showDetail?: boolean;
    /** 是否刷新闲置超时时间 */
    refreshSession?: boolean;
}

/**
 * 组合接口rest
 */
export interface CompositeRest {
    rest: Rest;
    method: HttpMethod;
    postBody?: any;
}

export type CompositeRestParam = CompositeRest[] | { [id: string]: CompositeRest };
export type CompositeRestResponse = HttpResponse[] | { [id: string]: HttpResponse };

/**
 * 返回结果说明，包含错误码和错误信息
 */
export interface Result {
    // 错误码
    code?: number;
    // 描述
    description: string;
    // 建议
    suggestion?: string;
    /**
     * 自定义提示信息
     */
    detail?: string;
    // 状态码
    status?: number;
}

export interface BaseHttpResponse {
    // 返回结果说明，包含错误码和错误信息
    result: Result;
    // 返回的结果数据
    data: any;
    // 兼容其他不可预知的字段，如登录返回的extraInfo
    [key: string]: any;
}

/**
 * http响应
 */
export interface HttpResponse extends BaseHttpResponse {
    // 原始http响应
    response?: Response;
    // rest
    rest?: Rest;
    // 请求选项
    options?: BaseRequestOptionsArgs;
    // 请求是否成功
    success?: boolean;
}

@Injectable()
export abstract class HttpService {
    // 当前请求中遮罩的总数
    protected maskCount = 0;
    // 是否会话失效
    protected sessionInvalid = false;
    /**
     * 是否忽略会话失效，忽略后请求不会触发next或error回调，也不会触发会话失效提示
     */
    protected ignoreSessionInvalid = false;
    // 默认请求选项
    protected defaultReqOptions: BaseRequestOptionsArgs = {
        doException: true,
        isException: (res) => res.result.code !== ERROR_OK
    };
    /**
     * 是否关闭不下发请求
     */
    protected closed = false;

    constructor(
        protected http: HttpClient,
        protected loadingService: LoadingService,
        protected i18nService: I18nService,
        protected cookieService: CookieService,
        protected logService: LogService
    ) { }

    /**
     * 统一拼接rest接口地址
     * @param namespace rest配置命名空间，不包含restType层。e.g：user.get、lun.put
     * @param restType rest类型
     */
    makeUrl(namespace: string, restType: string = 'IBASE', vstore: boolean = false): Rest {
        const restConfig = CORE_CONFIG.restConfig;

        if (!restConfig) {
            throw new Error('restConfig is not undefined');
        }

        if (!namespace) {
            throw new Error('namespace is not valid');
        }

        namespace = restType + '.mo.' + namespace;

        let config = result(restConfig, namespace);
        if (!config) {
            throw new Error(namespace + ' is not exist');
        }
        config = { ...config };
        config.namespace = namespace;
        config.vstore = vstore;
        let restObj = restConfig[restType];
        // 是否需要加上deviceId
        if (restObj.needDeviceId) {
            let deviceId = this.cookieService.getDeviceId();
            config.url = restObj.urlPrefix + '/' + deviceId + config.url;
        } else {
            config.url = restObj.urlPrefix + config.url;
        }
        const rest = new Rest(config, restType);

        return rest;
    }

    /**
     * 从某个批量查询的rest生成一个默认的总数rest
     * @param rest
     */
    getDefaultCountRest(rest: Rest) {
        const countBaseUrl = rest.baseUrl + (rest.type === 'IBASE' ? '/count' : '.count()');
        // 先克隆一个rest，保证查询参数和批量查询的rest一致
        rest = rest.clone();
        (rest as any).baseUrl = countBaseUrl;

        if (rest.namespace) {
            const mo = rest.namespace.split('.')[2];
            const restConfig = CORE_CONFIG.restConfig;
            const typeRestConfig = restConfig[rest.type];
            const moRestConfig = typeRestConfig.mo[mo];
            const deviceId = this.cookieService.getDeviceId();

            if (moRestConfig) {
                for (const opt of Object.keys(moRestConfig)) {
                    const url = restConfig[rest.type].needDeviceId
                        ? typeRestConfig.urlPrefix + '/' + deviceId + moRestConfig[opt].url
                        : typeRestConfig.urlPrefix + moRestConfig[opt].url;
                    if (countBaseUrl === url) {
                        const newRest = this.makeUrl(mo + '.' + opt, rest.type);
                        rest.namespace = newRest.namespace;
                        rest.name = newRest.name;
                        break;
                    }
                }
            }
        }

        return rest;
    }

    /**
     * 为请求选项添加必要字段
     * @param method 请求方法
     * @param rest rest对象
     * @param options 外部传入的已有选项
     */
    getRequestOptionArgs(method: HttpMethod, rest: Rest, options: BaseRequestOptionsArgs, body?: any): BaseRequestOptionsArgs {
        options = {
            ...this.defaultReqOptions,
            method,
            body,
            ...options,
            url: rest.url
        };

        // 指定请求响应为JSON
        (options as any).observe = 'response';
        (options as any).responseType = 'json';

        // 如果rest上配置了自动添加vstoreId且业务没有下发vstoreId则在这里添加vstoreId
        if (rest.vstore) {
            let vstoreId: string = this.cookieService._get('vstoreId');
            if (vstoreId === '') vstoreId = '-1';

            if (vstoreId) {
                // GET、DELETE将vstoreId添加到url上
                if ((method === 'GET' || method === 'DELETE') && !rest.hasParam('vstoreId')) {
                    options.url += (options.url.includes('?') ? '&' : '?') + 'vstoreId=' + vstoreId;
                } else if ((method === 'POST' || method === 'PUT') && (!options.body || options.body.vstoreId === undefined)) {
                    // POST、PUT将vstoreId添加到body上
                    options.body = {
                        ...options.body,
                        vstoreId
                    };
                }
            }
        }

        // 是否需要添加请求时间戳
        if (CORE_CONFIG.http.requestTimestamp) {
            options.url += (options.url.includes('?') ? '&' : '?') + 't=' + Date.now();
        }

        if (!options.headers) {
            options.headers = new HttpHeaders();
        }

        options.headers = options.headers.set('Accept-Language', this.i18nService.language);
        options.headers = options.headers.set('Content-Type', 'application/json; charset=UTF-8');

        const authToken = this.cookieService.getToken();
        if (authToken) {
            options.headers = options.headers.set(CORE_CONFIG.requestTokenKey, authToken);
        }

        return options;
    }

    /**
     * http请求拦截处理
     * 1、添加遮罩
     * 2、返回结果适配
     * 3、登录失效退出登录
     * @param observable 请求返回的可观察对象
     * @param rest rest对象
     * @param options 请求选项
     */
    intercept(rest: Rest, options: BaseRequestOptionsArgs): Observable<HttpResponse> {
        let sub$: Subscription;
        let ob$ = new Observable<HttpResponse>((observer: Subscriber<HttpResponse>) => {
            if (this.closed) {
                return;
            }

            // 显示遮罩
            if (options.mask) {
                this.maskCount++;
                this.loadingService.show();
            }

            const requestTimeout = options.timeout || rest.timeout || CORE_CONFIG.http.timeout;
            let timer$: Subscription;
            if (options.refreshSession) {
                timer$ = this.refreshSessionTime(requestTimeout);
            }
            sub$ = this.http.request(options.method, options.url, options)
                .pipe(
                    // 超时处理
                    timeout(requestTimeout),
                    // 处理JSON特殊字符解析失败导致的问题
                    catchError((err) => {
                        if (err instanceof HttpErrorResponse) {
                            if (err.error && err.error.error) {
                                const reg = /JSON/;
                                if (reg.test(err.error.error.toString()) // 非IE浏览器JSON解析错误
                                    || err.error.error.stack.includes('SyntaxError') // IE浏览器是语法错误
                                ) {
                                    let text = '';

                                    for (const ch of (err.error.text as string)) {
                                        if (ch !== '"' && ch !== '\\') {
                                            const convertedCh = JSON.stringify(ch);
                                            text += convertedCh.slice(1, convertedCh.length - 1);
                                        } else {
                                            text += ch;
                                        }
                                    }

                                    const response = new HttpClientResponse({
                                        body: JSON.parse(text),
                                        headers: err.headers,
                                        status: err.status,
                                        statusText: err.statusText,
                                        url: err.url
                                    });

                                    return of(response);
                                }
                            }
                        }
                        return throwError(err);
                    }),
                    // 统一返回结果
                    map((response: HttpClientResponse<any>) => {
                        const res = response.body;
                        let responseNew: HttpResponse;
                        if (options.adaptResult) {
                            responseNew = {
                                ...res,
                                ...options.adaptResult(res, rest, options)
                            };
                        } else {
                            responseNew = {
                                ...res,
                                ...this.adaptResponse(res, rest, options)
                            };
                        }
                        return responseNew;
                    }),
                    // 完成，隐藏遮罩
                    finalize(() => {
                        if (options.mask && this.maskCount > 0) {
                            this.maskCount--;
                            if (this.maskCount === 0) {
                                this.loadingService.hide();
                            }
                        }
                        if (timer$) {
                            timer$.unsubscribe();
                        }
                        observer.complete();
                    })
                )
                .subscribe((res) => {
                    // 如果有请求已经发生了登录失效，则后续请求都不处理
                    if (this.sessionInvalid) {
                        return;
                    }

                    res.rest = rest;
                    res.options = options;

                    // 鉴权失败
                    if (!this.ignoreSessionInvalid && this.isSessionInvalid(res)) {
                        this.sessionInvalid = true;
                        this.logError(res);
                        return;
                    }

                    res.success = !options.isException(res);

                    // 通用处理异常
                    if (!res.success) {
                        if (!this.ignoreSessionInvalid && options.doException) {
                            this.handleException(rest, res, options);
                        }
                        observer.error(res);
                        this.logError(res);
                        return;
                    }

                    // 通用成功处理成功
                    if (options.doSuccess) {
                        this.handleSuccess(rest, options);
                    }
                    observer.next(res);
                }, (err: any) => {
                    // 如果会话已经失效，则后续请求都不处理
                    if (this.sessionInvalid) {
                        return;
                    }

                    let res: HttpResponse;

                    if (err instanceof TimeoutError) { // 请求超时
                        res = {
                            result: {
                                status: 408,
                                description: this.i18nService.get('requestTimeout_lab')
                            },
                            data: undefined
                        };
                    } else if (err.status !== 200) { // HTTP状态码不为200均为错误
                        res = {
                            result: {
                                status: err.status,
                                description: this.i18nService.get('systemBusy_msg')
                            },
                            data: undefined
                        };
                    } else if (err instanceof HttpErrorResponse) { // HTTP错误响应
                        res = {
                            result: {
                                status: -1,
                                description: err.message
                            },
                            data: undefined
                        };
                    } else if (err instanceof Error) { // 其他错误视为内部错误
                        res = {
                            result: {
                                status: -1,
                                description: err.message + (err.stack ? '<br>' + err.stack : '')
                            },
                            data: undefined
                        };
                    } else {
                        res = err;
                    }

                    res.response = err;
                    res.rest = rest;
                    res.options = options;

                    // 通用处理异常
                    if (options.doException) {
                        this.handleException(rest, res, options);
                    }
                    observer.error(res);
                    this.logError(res);
                });
        })
            .pipe(
                finalize(() => {
                    if (sub$ && !sub$.closed) {
                        sub$.unsubscribe();
                    }
                    sub$ = null;
                })
            );

        (ob$ as any).rest = rest;
        (ob$ as any).options = options;

        return ob$;
    }

    /**
     * 对响应结果进行通用适配
     */
    abstract adaptResponse(res: any, rest: Rest, options: BaseRequestOptionsArgs): HttpResponse;

    /**
     * 判断当前响应是否为会话失效
     */
    abstract isSessionInvalid(res: HttpResponse): boolean;

    /**
     * 处理http成功信息
     * @param rest rest
     */
    abstract handleSuccess(rest: Rest, options?: BaseRequestOptionsArgs): void;

    /**
     * 处理http异常信息
     * @param rest rest
     * @param res 返回结果
     * @param options 选项
     */
    abstract handleException(rest: Rest, res: HttpResponse, options?: BaseRequestOptionsArgs): void;

    /**
     * 刷新闲置超时时间
     * @param requestTimeout 接口超时时间
     */
    abstract refreshSessionTime(requestTimeout: number): Subscription;

    get(rest: Rest, options?: BaseRequestOptionsArgs): Observable<HttpResponse> {
        if (typeof rest.remoteDeviceId === 'number') {
            return this.remoteExecute(rest.remoteDeviceId, rest, 'GET', {}, options);
        }
        const opts = this.getRequestOptionArgs('GET', rest, options);
        return this.intercept(rest, opts);
    }

    post(rest: Rest, body: any, options?: BaseRequestOptionsArgs): Observable<HttpResponse> {
        if (typeof rest.remoteDeviceId === 'number') {
            return this.remoteExecute(rest.remoteDeviceId, rest, 'POST', body, options);
        }
        const opts = this.getRequestOptionArgs('POST', rest, options, body);
        return this.intercept(rest, opts);
    }

    put(rest: Rest, body: any, options?: BaseRequestOptionsArgs): Observable<HttpResponse> {
        if (typeof rest.remoteDeviceId === 'number') {
            return this.remoteExecute(rest.remoteDeviceId, rest, 'PUT', body, options);
        }

        const opts = this.getRequestOptionArgs('PUT', rest, options, body);
        return this.intercept(rest, opts);
    }

    delete(rest: Rest, options?: BaseRequestOptionsArgs): Observable<HttpResponse> {
        if (typeof rest.remoteDeviceId === 'number') {
            return this.remoteExecute(rest.remoteDeviceId, rest, 'DELETE', {}, options);
        }
        const opts = this.getRequestOptionArgs('DELETE', rest, options);
        return this.intercept(rest, opts);
    }

    /**
     * 组合请求
     * @param compositeRests
     * @param options
     */
    composite(compositeRests: CompositeRestParam, options?: BaseRequestOptionsArgs): Observable<CompositeRestResponse> {
        const rest = this.makeUrl('server.doComposite', 'IBASE');
        const params = {};
        const idIndexMap = {};
        const isArray = Array.isArray(compositeRests);
        const results: CompositeRestResponse = isArray ? [] : {};

        for (let i of Object.keys(compositeRests)) {
            const id = isArray ? 'composite_' + i : i;
            const compositeRest = compositeRests[i];

            idIndexMap[id] = i;
            params[id] = {
                url: 'https://127.0.0.1' + compositeRest.rest.url,
                method: compositeRest.method,
                para: compositeRest.postBody
            };
        }

        return this.post(rest, params, options)
            .pipe(
                map(({ data, response }) => {
                    const ops = this.getRequestOptionArgs('POST', rest, options);

                    // 组装返回结果
                    for (let id of Object.keys(data)) {
                        const i = idIndexMap[id];
                        results[i] = {
                            ...data[i],
                            result: compositeRests[i].rest.type === 'IBASE' ? data[i].error : data[i].result,
                            data: data[i].data,
                            response
                        };
                    }

                    // 处理异常
                    if (ops && ops.doException) {
                        for (let i of Object.keys(results)) {
                            const result = results[i];
                            // 通用处理异常
                            if (ops.isException(result)) {
                                this.handleException(compositeRests[i].rest, result, ops);
                            }
                        }
                    }

                    return results;
                })
            );
    }

    /**
     * 在远端设备上执行请求
     * @param deviceId 远端设备ID
     * @param rest 远端请求Rest对象
     * @param method 请求方法
     * @param body 请求发送的数据
     */
    abstract remoteExecute(deviceId: number, rest: Rest, method: HttpMethod, body: any, options?: BaseRequestOptionsArgs);

    /**
     * 是否跳过记录该错误日志
     * @param res
     */
    abstract isSkipLogError(res: HttpResponse): boolean;

    /**
     * 启用会话失效检查
     */
    enableSessionInvalidCheck() {
        this.ignoreSessionInvalid = false;
    }

    /**
     * 禁用会话失效检查
     */
    disableSessionInvalidCheck() {
        this.ignoreSessionInvalid = true;
    }

    /**
     * 禁用下发请求
     */
    disableRequest() {
        this.closed = true;
    }

    /**
     * 启用下发请求
     */
    enableRequest() {
        this.closed = false;
    }

    /**
     * 记录http请求错误
     * @param res
     */
    logError(res: HttpResponse): void {
        if (this.isSkipLogError(res)) return;

        const log = {
            options: res.options,
            result: res.result
        };

        // 删除敏感信息
        delete log.options.headers;

        this.logService.error(log);
    }
}
