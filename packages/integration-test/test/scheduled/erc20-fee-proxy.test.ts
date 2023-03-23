import { Erc20PaymentNetwork } from '@requestnetwork/payment-detection';
import { PaymentTypes, RequestLogicTypes } from '@requestnetwork/types';
import { CurrencyManager } from '@requestnetwork/currency';

import { mockAdvancedLogic } from './mocks';
import { Types, Utils } from '@requestnetwork/request-client.js';
import {
  erc20requestCreationHash,
  localErc20PaymentNetworkParams,
  payeeIdentity,
  payerIdentity,
  privateErc20Address,
  requestNetwork,
} from './fixtures';
import { createMockErc20FeeRequest } from '../utils';

const erc20FeeProxy = new Erc20PaymentNetwork.ERC20FeeProxyPaymentDetector({
  advancedLogic: mockAdvancedLogic,
  currencyManager: CurrencyManager.getDefault(),
  getSubgraphClient: jest.fn(),
});

describe('ERC20 Fee Proxy detection test-suite', () => {
  it('can getBalance on a mainnet request', async () => {
    const mockRequest = createMockErc20FeeRequest({
      network: 'mainnet',
      requestId: '016d4cf8006982f7d91a437f8c72700aa62767de00a605133ee5f84ad8d224ba04',
      paymentAddress: '0x4E64C2d06d19D13061e62E291b2C4e9fe5679b93',
      salt: '8097784e131ee627',
      tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      feeAddress: '0x35d0e078755cd84d3e0656caab417dee1d7939c7',
      feeAmount: '10',
    });

    const balance = await erc20FeeProxy.getBalance(mockRequest);

    expect(balance.balance).toBe('1000000000000000000');
    expect(balance.events).toHaveLength(1);
    expect(balance.events[0].name).toBe('payment');
    const params = balance.events[0].parameters as PaymentTypes.IERC20FeePaymentEventParameters;
    expect(params?.to).toBe('0x4E64C2d06d19D13061e62E291b2C4e9fe5679b93');
    expect(balance.events[0].amount).toBe('1000000000000000000');
    expect(balance.events[0].timestamp).toBe(1599070058);
  }, 10000);

  it('can getBalance on a rinkeby request', async () => {
    const mockRequest = createMockErc20FeeRequest({
      network: 'rinkeby',
      requestId: '0188791633ff0ec72a7dbdefb886d2db6cccfa98287320839c2f173c7a4e3ce7e1',
      paymentAddress: '0x4E64C2d06d19D13061e62E291b2C4e9fe5679b93',
      salt: '0ee84db293a752c6',
      tokenAddress: '0xFab46E002BbF0b4509813474841E0716E6730136', // FAU
      feeAddress: '0x35d0e078755cd84d3e0656caab417dee1d7939c7',
      feeAmount: '1000000000000000',
    });

    const balance = await erc20FeeProxy.getBalance(mockRequest);

    expect(balance.balance).toBe('1000000000000000000000');
    expect(balance.events).toHaveLength(1);
    expect(balance.events[0].name).toBe('payment');
    const params = balance.events[0].parameters as PaymentTypes.IERC20FeePaymentEventParameters;
    expect(params?.to).toBe('0x4E64C2d06d19D13061e62E291b2C4e9fe5679b93');
    expect(balance.events[0].amount).toBe('1000000000000000000000');
    expect(balance.events[0].timestamp).toBe(1599013969);
  }, 10000);

  it('can getBalance on a matic request, with TheGraph', async () => {
    const mockRequest = createMockErc20FeeRequest({
      network: 'matic',
      requestId: '014bcd076791fb915af457df1d3f26c81ff66f7e278e4a18f0e48a1705572a6306',
      paymentAddress: '0x4E64C2d06d19D13061e62E291b2C4e9fe5679b93',
      salt: '8c5ea6f8b4a14fe0',
      tokenAddress: '0x282d8efce846a88b159800bd4130ad77443fa1a1', // FAU
      feeAddress: '0x35d0e078755cd84d3e0656caab417dee1d7939c7',
      feeAmount: '1000000000000000',
    });

    const balance = await erc20FeeProxy.getBalance(mockRequest);

    expect(balance.balance).toBe('1000000000000000000');
    expect(balance.events).toHaveLength(1);
    expect(balance.events[0].name).toBe('payment');
    const params = balance.events[0].parameters as PaymentTypes.IERC20FeePaymentEventParameters;
    expect(params.to).toBe('0x4E64C2d06d19D13061e62E291b2C4e9fe5679b93');
    expect(balance.events[0].amount).toBe('1000000000000000000');
    expect(balance.events[0].timestamp).toBe(1621953168);
  }, 15000);

  it('can getBalance for a payment declared by the payee', async () => {
    // Create a request
    const request = await requestNetwork.createRequest({
      paymentNetwork: localErc20PaymentNetworkParams,
      requestInfo: erc20requestCreationHash,
      signer: payeeIdentity,
    });

    // The payee declares the payment
    let requestData = await request.declareReceivedPayment('1', 'OK', payeeIdentity, '0x1234');
    const declarationTimestamp = Utils.getCurrentTimestampInSecond();
    requestData = await new Promise((resolve): any => requestData.on('confirmed', resolve));

    const balance = await erc20FeeProxy.getBalance({
      ...requestData,
      currency: {
        network: 'private',
        type: RequestLogicTypes.CURRENCY.ERC20,
        value: privateErc20Address,
      },
    });

    expect(balance.balance).toBe('1');
    expect(balance.events).toHaveLength(1);
    expect(balance.events[0].name).toBe('payment');
    expect(balance.events[0].amount).toBe('1');
    expect(Math.abs(declarationTimestamp - (balance.events[0].timestamp ?? 0))).toBeLessThan(5);
  }, 15000);

  it('getBalance = 0 if the payer declared the payment', async () => {
    // Create a request
    const request = await requestNetwork.createRequest({
      paymentNetwork: localErc20PaymentNetworkParams,
      requestInfo: erc20requestCreationHash,
      signer: payeeIdentity,
    });

    // The payer declares a payment
    let requestData: Types.IRequestDataWithEvents = await request.declareSentPayment(
      '1',
      'OK',
      payerIdentity,
    );
    requestData = await new Promise((resolve): any => requestData.on('confirmed', resolve));
    const balance = await erc20FeeProxy.getBalance({
      ...requestData,
      currency: {
        network: 'private',
        type: RequestLogicTypes.CURRENCY.ERC20,
        value: privateErc20Address,
      },
    });
    expect(balance.balance).toBe('0');
    expect(balance.events).toHaveLength(0);
  }, 15000);
});
