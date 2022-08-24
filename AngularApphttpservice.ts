import {
    HttpService, Rest, BaseRequestOptionsArgs, HttpResponse, ToastService, LoadingService, I18nService, CookieService
} from 'package';
import { Injectable } from '@angular/core';
import { LogService } from '../package/services/log.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppHttpService extends HttpService {
    constructor(
        http: HttpClient,
        loadingService: LoadingService,
        i18nService: I18nService,
        cookieService: CookieService,
        logService: LogService,
        private toastService: ToastService
    ) {
        super(http, loadingService, i18nService, cookieService, logService);
    }

    adaptResponse(res: any, rest: Rest): HttpResponse {
        let responseNew: HttpResponse;

        if (rest.type === 'IBASE') {
            responseNew = {
                ...res,
                result: {
                    code: res.error.code,
                    description: res.error.description,
                    suggestion: res.error.suggestion
                },
                data: res.data
            };
            delete responseNew.error;
        } else if (rest.type === 'V2') {
            responseNew = {
                ...res,
                result: {
                    code: res.result.code,
                    description: res.result.description,
                    suggestion: res.result.suggestion
                },
                data: res.data
            };
        } else {
            throw new Error('Can not adaptResult res: ' + JSON.stringify(res));
        }
        return responseNew;
    }

    isSessionInvalid(res: HttpResponse) {
        return res.result.code === -401;
    }

    /**
     * 刷新闲置超时时间
     * @param requestTimeout 接口超时时间
     */
    refreshSessionTime(requestTimeout: number): Subscription {
        return null;
    }

    /**
     * 处理http成功信息
     * @param rest rest
     */
    handleSuccess(rest: Rest, options?: BaseRequestOptionsArgs) {
        let msg;
        if (options && options.name) {
            msg = `<div>${this.i18nService.get('common.rest_success_label', [options.name])}</div>`;
        } else if (rest.name) {
            // tslint:disable-next-line:max-line-length
            msg = `<div>${this.i18nService.get('common.rest_success_label', [this.i18nService.get('rest.' + rest.name, options ? options.restNameParams : [])])}</div>`;
        } else {
            msg = `<div>${this.i18nService.get('common.downloadsuccess_label')}</div>`;
        }
        return this.toastService.success(msg);
    }

    /**
     * 处理http异常信息
     * @param rest rest
     * @param res 返回结果
     * @param options 选项
     */
    handleException(rest: Rest, res: HttpResponse, options?: BaseRequestOptionsArgs) {
        let msg;
        if (options && options.name) {
            msg = `<div>${this.i18nService.get('common.rest_fail_label', [options.name])}</div>`;
        } else if (rest.name) {
            // tslint:disable-next-line:max-line-length
            msg = `<div>${this.i18nService.get('common.rest_fail_label', [this.i18nService.get('rest.' + rest.name, options ? options.restNameParams : [])])}</div>`;
        } else {
            msg = `<div>${this.i18nService.get('common.requestFailed_label')}</div>`;
        }
        // tslint:disable-next-line:max-line-length
        msg += `<div style="white-space: pre-wrap;">${this.i18nService.get('common.description_column', true) + res.result.description}</div>`;
        if (res.result.suggestion) {
            // tslint:disable-next-line:max-line-length
            msg += `<div style="white-space: pre-wrap;">${this.i18nService.get('common.suggest_label', true) + res.result.suggestion}</div>`;
        }
        return this.toastService.error(msg);
    }

    remoteExecute() { }

    isSkipLogError() {
        return false;
    }
}
