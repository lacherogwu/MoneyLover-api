This library is used to interact with [MoneyLover](https://moneylover.me/)

## Installation

```bash
npm i moneylover
```

## Usage

```js
import MoneyLover from 'moneylover';

const accessToken = await MoneyLover.authenticate('EMAIL', 'PASSWORD');
const moneyLoverApi = new MoneyLover(accessToken);

const wallets = await moneyLoverApi.listWallets();

await moneyLoverApi.adjustBalance({
	walletId: wallets[0]._id,
	amount: 500,
});
```

This library is new, so in case you looking for something that is not implemented yet, please open an issue or a pull request on Github.
