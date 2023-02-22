import FormData from 'form-data';
import fetch, { Response } from 'node-fetch';

type Config = {
	baseURL?: string;
	headers?: Record<string, string>;
	locals?: Record<string, any>;
};

type RequestInfo = {
	method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
	url: string;
} & RequestOptions;

type RequestOptions = {
	headers?: any;
	data?: any;
	query?: any;
};

class ApiError<T> extends Error {
	response: ApiResponse<T>;
	constructor(response: ApiResponse<T>) {
		super(response.statusText);
		this.response = response;
	}
}

interface ApiResponse<T = string | Record<string, any>> extends Response {
	data: T;
}

class ApiClient {
	config: Config;
	#requestInterceptors: any[] = [];
	#responseInterceptors: any[] = [];

	constructor(config: Config) {
		const locals = config.locals || {};
		this.config = {
			locals,
			...config,
		};
	}

	addRequestInterceptor(cb: (requestInfo: RequestInfo) => Promise<RequestInfo | void> | RequestInfo | void) {
		this.#requestInterceptors.push(cb);
	}
	addResponseInterceptor(cb: (response: ApiResponse) => Promise<ApiResponse | void> | ApiResponse | void) {
		this.#responseInterceptors.push(cb);
	}

	static #prepareUrl(url: string, query: Record<string, string>) {
		let _url = url;
		const searchParams = new URLSearchParams(query);
		if (searchParams.toString()) {
			_url += `?${searchParams.toString()}`;
		}
		return new URL(_url);
	}

	async request<T>(requestInfo: RequestInfo): Promise<ApiResponse<T>> {
		const url = ApiClient.#prepareUrl((this.config.baseURL || '') + requestInfo.url, requestInfo.query);

		for (const requestInterceptor of this.#requestInterceptors) {
			const result = await requestInterceptor(requestInfo);
			if (result) {
				requestInfo = result;
			}
		}

		if (requestInfo.data instanceof FormData) {
			requestInfo.headers = {
				...requestInfo.headers,
				'Content-Type': 'multipart/form-data',
			};
		} else if (typeof requestInfo.data === 'object') {
			requestInfo.headers = {
				...requestInfo.headers,
				'Content-Type': 'application/json',
			};
			requestInfo.data = JSON.stringify(requestInfo.data);
		}

		const fetchResponse = await fetch(url.toString(), {
			method: requestInfo.method,
			headers: {
				...this.config.headers,
				...requestInfo.headers,
			},
			body: requestInfo.data,
		});

		let response = {} as ApiResponse<T>;
		Object.assign(response, fetchResponse);

		if (fetchResponse.headers.get('Content-Type')?.includes('application/json')) {
			Object.assign(response, { data: await fetchResponse.json() });
		} else {
			Object.assign(response, { data: await fetchResponse.text() });
		}

		for (const responseInterceptors of this.#responseInterceptors) {
			const result = await responseInterceptors(response);
			if (result) {
				response = result;
			}
		}

		if (!fetchResponse.ok) throw new ApiError(response);

		return response;
	}

	async get<T>(url: string, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'GET',
			url,
			...options,
		});

		return response;
	}

	async post<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'POST',
			url,
			data,
			...options,
		});

		return response;
	}

	async patch<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'PATCH',
			url,
			data,
			...options,
		});

		return response;
	}

	async put<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'PUT',
			url,
			data,
			...options,
		});

		return response;
	}

	async delete<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'DELETE',
			url,
			data,
			...options,
		});

		return response;
	}

	static async request<T>(requestInfo: RequestInfo): Promise<ApiResponse<T>> {
		const url = this.#prepareUrl(requestInfo.url, requestInfo.query);

		if (requestInfo.data instanceof FormData) {
			requestInfo.headers = {
				...requestInfo.headers,
				'Content-Type': 'multipart/form-data',
			};
		} else if (typeof requestInfo.data === 'object') {
			requestInfo.headers = {
				...requestInfo.headers,
				'Content-Type': 'application/json',
			};
			requestInfo.data = JSON.stringify(requestInfo.data);
		}

		const fetchResponse = await fetch(url.toString(), {
			method: requestInfo.method,
			headers: {
				...requestInfo.headers,
			},
			body: requestInfo.data,
		});

		const response = {} as ApiResponse<T>;
		Object.assign(response, fetchResponse);

		if (fetchResponse.headers.get('Content-Type')?.includes('application/json')) {
			Object.assign(response, { data: await fetchResponse.json() });
		} else {
			Object.assign(response, { data: await fetchResponse.text() });
		}

		if (!fetchResponse.ok) throw new ApiError(response);

		return response;
	}

	static async get<T>(url: string, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'GET',
			url,
			...options,
		});

		return response;
	}

	static async post<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'POST',
			url,
			data,
			...options,
		});

		return response;
	}

	static async patch<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'PATCH',
			url,
			data,
			...options,
		});

		return response;
	}

	static async put<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'PUT',
			url,
			data,
			...options,
		});

		return response;
	}

	static async delete<T>(url: string, data?: any, options?: RequestOptions) {
		const response = await this.request<T>({
			method: 'DELETE',
			url,
			data,
			...options,
		});

		return response;
	}
}

export default ApiClient;
