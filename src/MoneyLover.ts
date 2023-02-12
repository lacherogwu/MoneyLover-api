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
} from './types.js';

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

	static async authenticate(email: string, password: string) {
		const { requestToken, client } = await this.#getLoginData();
		const token = await this.#getToken({ email, password, requestToken, client });
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
		} catch {
			throw new Error('could not get login details');
		}
	}

	static async #getToken(params: GetTokenParams) {
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

			return response.access_token;
		} catch {
			throw new Error('could not get token');
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
