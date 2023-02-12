export type GetTokenResponse = {
	access_token: string;
};

export type GetLoginDataResponse = {
	data: {
		request_token: string;
		login_url: string;
	};
};

export type Wallet = {
	_id: string;
	name: string;
	currency_id: number;
	owner: string;
	sortIndex: number;
	transaction_notification: boolean;
	archived: boolean;
	account_type: number;
	exclude_total: boolean;
	icon: string;
	listUser: {
		_id: string;
		email: string;
	}[];
	createdAt: string;
	updateAt: string;
	isDelete: boolean;
	balance: {
		USD: string;
	}[];
};

export type Category = {
	_id: string;
	name: string;
	icon: string;
	account: string;
	type: number;
	metadata: string;
};

export type Transaction = {
	_id: string;
	account: string;
	amount: number;
	category: string;
	displayDate: string;
	with: any[];
	note: string;
	tokenDevice: string;
};

export type GetTokenParams = {
	email: string;
	password: string;
	requestToken: string;
	client: string;
};

export type GetWalletInfoParams = {
	id?: string;
	name?: string;
};

export type AddTransactionParams = {
	walletId: string;
	amount: number;
	categoryId: string;
	displayDate: Date;
	excludeReport?: boolean;
	image?: string;
	note?: string;
	withList?: string[];
};

export type GetCategoryIdParams = {
	walletId: string;
	type: 'income' | 'expense';
};

export type AdjustBalanceParams = {
	walletId: string;
	amount: number;
};
