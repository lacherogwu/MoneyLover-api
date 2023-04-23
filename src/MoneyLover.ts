import os from 'os';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import ApiClient from './ApiClient.js';
import type {
	GetTokenResponse, //
	GetLoginDataResponse,
	Wallet,
	Category,
	Transaction,
	GetTokenParams,
	GetWalletInfoParams,
	AddTransactionParams,
	GetCategoryIdParams,
	AdjustBalanceParams,
	GetRefreshTokenResponse,
	AuthData,
} from './types.js';

export * from './types.js';

async function isPathExists(path: string) {
	return fs
		.stat(path)
		.then(() => true)
		.catch(() => false);
}

class MoneyLover {
	#client;
	#categories: Category[] = [];
	#wallets: Wallet[] = [];

	constructor(accessToken: string) {
		this.#client = new ApiClient({
			baseURL: 'https://web.moneylover.me/api',
			headers: {
				Authorization: `AuthJWT ${accessToken}`,
			},
		});
	}

	static #isValidCachedFile(data: Record<string, string>): data is AuthData {
		try {
			const keys = ['accessToken', 'refreshToken', 'expire'] as const;
			keys.forEach(key => {
				if (!data[key]) throw Error;
			});
			return true;
		} catch {
			return false;
		}
	}

	static #parseCachedFileData(rawData: string): Record<string, string> {
		try {
			return JSON.parse(rawData);
		} catch (err) {
			return {};
		}
	}

	static #isTokenExpired(expire: string) {
		const now = Date.now() / 1000;
		return now > +expire;
	}

	static async #refreshToken(refreshToken: string) {
		try {
			const { data: response } = await ApiClient.post<GetRefreshTokenResponse>('https://web.moneylover.me/api/user/refresh-token', {
				refreshToken,
			});

			return this.#parseAuthResponse(response.data);
		} catch (err) {
			throw new Error('could not refresh token');
		}
	}

	static async authenticate(email: string, password: string) {
		const basePath = os.tmpdir() + '/.moneylover';
		const hash = crypto.createHash('sha256').update(`${email}:${password}`).digest('hex');
		const filePath = path.resolve(basePath, hash + '.json');

		if (!(await isPathExists(filePath))) {
			await fs.mkdir(basePath).catch(() => {});
			await fs.writeFile(filePath, '{}');
		}

		let token: string;
		let auth: AuthData | undefined;

		const cachedFileRawData = await fs.readFile(filePath, 'utf-8');
		const cachedFileData = this.#parseCachedFileData(cachedFileRawData);
		if (this.#isValidCachedFile(cachedFileData)) {
			const isExpire = this.#isTokenExpired(cachedFileData.expire);
			if (isExpire) {
				auth = await this.#refreshToken(cachedFileData.refreshToken);
				token = auth.accessToken;
			} else {
				token = cachedFileData.accessToken;
			}
		} else {
			const { requestToken, client } = await this.#getLoginData();
			auth = await this.#getAuth({ email, password, requestToken, client });
			token = auth.accessToken;
		}

		if (auth) {
			await fs.writeFile(filePath, JSON.stringify(auth));
		}

		return token;
	}

	static async #getLoginData() {
		try {
			const { data: response } = await ApiClient.post<GetLoginDataResponse>('https://web.moneylover.me/api/user/login-url');
			const { request_token, login_url } = response.data;
			const [, client] = login_url.match(/client=(.+?)&/)!;

			return {
				requestToken: request_token,
				client,
			};
		} catch (err) {
			throw new Error('could not get login details');
		}
	}

	static #parseAuthResponse(response: GetTokenResponse) {
		return {
			accessToken: response.access_token,
			refreshToken: response.refresh_token,
			expire: response.expire,
		};
	}

	static async #getAuth(params: GetTokenParams) {
		const { email, password, requestToken, client } = params;
		try {
			const body = {
				email: email,
				password: password,
			};
			const headers = {
				Authorization: `Bearer ${requestToken}`,
				client,
			};

			const { data: response } = await ApiClient.post<GetTokenResponse>('https://oauth.moneylover.me/token', body, {
				headers,
			});
			if (!response.status) throw new Error(response.message);

			return this.#parseAuthResponse(response);
		} catch (err: any) {
			throw new Error(err?.message ?? 'could not get token');
		}
	}

	async listWallets() {
		if (this.#wallets.length) return this.#wallets;

		const { data: response } = await this.#client.post<{ data: Wallet[] }>('/wallet/list');
		this.#wallets = response.data;

		return this.#wallets;
	}

	async getWalletInfo(params: GetWalletInfoParams) {
		const { id, name } = params;
		const wallets = await this.listWallets();
		const wallet = wallets.find(item => item._id === id || item.name === name);
		if (!wallet) throw new Error('wallet not found');

		return wallet;
	}

	async addTransaction(params: AddTransactionParams) {
		const { walletId, amount, categoryId, displayDate, excludeReport, image, note, withList } = params;
		const { data: response } = await this.#client.post<{ data: Transaction }>('/transaction/add', {
			account: walletId,
			amount,
			category: categoryId,
			displayDate,
			excludeReport,
			image,
			note,
			with: withList,
		});

		return response.data;
	}

	async listCategories() {
		if (this.#categories.length) {
			return this.#categories;
		}

		const { data: response } = await this.#client.post<{ data: Category[] }>('/category/list-all');
		this.#categories = response.data;

		return response.data;
	}

	async getCategoryId(params: GetCategoryIdParams) {
		const { walletId, type } = params;

		const transactionType = type === 'income' ? 'IS_OTHER_INCOME' : 'IS_OTHER_EXPENSE';
		const categories = await this.listCategories();
		const category = categories.find(item => item.account === walletId && item.metadata === transactionType);
		if (!category) throw new Error('category not found');

		return category._id;
	}

	async adjustBalance(params: AdjustBalanceParams) {
		const { walletId, amount } = params;

		const walletInfo = await this.getWalletInfo({ id: walletId });
		const walletBalance = +Object.values(walletInfo.balance[0])[0];

		if (amount === walletBalance) return;
		const categoryType = amount > walletBalance ? 'income' : 'expense';
		const categoryId = await this.getCategoryId({ walletId, type: categoryType });
		const finalAmount = Math.abs(amount - walletBalance);

		return await this.addTransaction({
			walletId,
			amount: finalAmount,
			categoryId,
			displayDate: new Date(),
			note: '[API] Adjust Balance',
		});
	}
}

export default MoneyLover;
