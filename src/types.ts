export type GetTokenResponse = {
	access_token: string;
};

export type GetLoginDataResponse = {
	data: {
		request_token: string;
		login_url: string;
	};
};

type Currency =
	| 'USD'
	| 'CAD'
	| 'EUR'
	| 'AED'
	| 'AFN'
	| 'ALL'
	| 'AMD'
	| 'ARS'
	| 'AUD'
	| 'AZN'
	| 'BAM'
	| 'BDT'
	| 'BGN'
	| 'BHD'
	| 'BIF'
	| 'BND'
	| 'BOB'
	| 'BRL'
	| 'BWP'
	| 'BYN'
	| 'BZD'
	| 'CDF'
	| 'CHF'
	| 'CLP'
	| 'CNY'
	| 'COP'
	| 'CRC'
	| 'CVE'
	| 'CZK'
	| 'DJF'
	| 'DKK'
	| 'DOP'
	| 'DZD'
	| 'EEK'
	| 'EGP'
	| 'ERN'
	| 'ETB'
	| 'GBP'
	| 'GEL'
	| 'GHS'
	| 'GNF'
	| 'GTQ'
	| 'HKD'
	| 'HNL'
	| 'HRK'
	| 'HUF'
	| 'IDR'
	| 'ILS'
	| 'INR'
	| 'IQD'
	| 'IRR'
	| 'ISK'
	| 'JMD'
	| 'JOD'
	| 'JPY'
	| 'KES'
	| 'KHR'
	| 'KMF'
	| 'KRW'
	| 'KWD'
	| 'KZT'
	| 'LBP'
	| 'LKR'
	| 'LTL'
	| 'LVL'
	| 'LYD'
	| 'MAD'
	| 'MDL'
	| 'MGA'
	| 'MKD'
	| 'MMK'
	| 'MOP'
	| 'MUR'
	| 'MXN'
	| 'MYR'
	| 'MZN'
	| 'NAD'
	| 'NGN'
	| 'NIO'
	| 'NOK'
	| 'NPR'
	| 'NZD'
	| 'OMR'
	| 'PAB'
	| 'PEN'
	| 'PHP'
	| 'PKR'
	| 'PLN'
	| 'PYG'
	| 'QAR'
	| 'RON'
	| 'RSD'
	| 'RUB'
	| 'RWF'
	| 'SAR'
	| 'SDG'
	| 'SEK'
	| 'SGD'
	| 'SOS'
	| 'SYP'
	| 'THB'
	| 'TND'
	| 'TOP'
	| 'TRY'
	| 'TTD'
	| 'TWD'
	| 'TZS'
	| 'UAH'
	| 'UGX'
	| 'UYU'
	| 'UZS'
	| 'VEF'
	| 'VND'
	| 'XAF'
	| 'XOF'
	| 'YER'
	| 'ZAR'
	| 'ZMK'
	| 'ZWL';

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
	balance: [Record<Currency, string>];
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
