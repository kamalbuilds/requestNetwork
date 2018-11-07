import Utils from '@requestnetwork/utils';
import Amount from '../amount';
import * as RequestEnum from '../enum';
import Request from '../request';
import Signature from '../signature';
import Transaction from '../transaction';
import * as Types from '../types';
import Version from '../version';

/**
 * Implementation of the action increaseExpectedAmount from request logic specification
 */
export default {
  applyTransactionToRequest,
  format,
};

/**
 * Function to format a transaction to increase expected amount of a Request
 *
 * @param IRequestLogicIncreaseExpectedAmountParameters increaseAmountParameters parameters to increase expected amount of a request
 * @param ISignatureParameters signatureParams Signature parameters
 *
 * @returns ISignedTransaction  the transaction with the signature
 */
function format(
  increaseAmountParameters: Types.IRequestLogicIncreaseExpectedAmountParameters,
  signatureParams: Types.IRequestLogicSignatureParameters,
): Types.IRequestLogicSignedTransaction {
  if (!Amount.isValid(increaseAmountParameters.deltaAmount)) {
    throw new Error('deltaAmount must be a string representing a positive integer');
  }

  const transaction: Types.IRequestLogicTransaction = {
    action: RequestEnum.REQUEST_LOGIC_ACTION.INCREASE_EXPECTED_AMOUNT,
    parameters: increaseAmountParameters,
    version: Version.currentVersion,
  };

  return Transaction.createSignedTransaction(transaction, signatureParams);
}

/**
 * Function to apply an increaseExpectedAmount transaction on a request
 *
 * @param Types.IRequestLogicSignedTransaction signedTransaction the signed transaction to apply
 *
 * @returns Types.IRequestLogicRequest the new request
 */
function applyTransactionToRequest(
  signedTransaction: Types.IRequestLogicSignedTransaction,
  request: Types.IRequestLogicRequest,
): Types.IRequestLogicRequest {
  const transaction = signedTransaction.transaction;

  if (!transaction.parameters.requestId) {
    throw new Error('requestId must be given');
  }
  if (!request.payer) {
    throw new Error('the request must have a payer');
  }
  if (!transaction.parameters.deltaAmount) {
    throw new Error('deltaAmount must be given');
  }
  if (!Amount.isValid(transaction.parameters.deltaAmount)) {
    throw new Error('deltaAmount must be a string representing a positive integer');
  }

  const signer: Types.IRequestLogicIdentity = Transaction.getSignerIdentityFromSignedTransaction(
    signedTransaction,
  );
  const signerRole = Request.getRoleInRequest(signer, request);

  request = Request.pushExtensions(request, transaction.parameters.extensions);

  if (signerRole === RequestEnum.REQUEST_LOGIC_ROLE.PAYER) {
    if (request.state === RequestEnum.REQUEST_LOGIC_STATE.CANCELLED) {
      throw new Error('the request must not be cancelled');
    }
    // increase the expected amount and store it as string
    request.expectedAmount = Amount.add(request.expectedAmount, transaction.parameters.deltaAmount);

    return request;
  }

  throw new Error('signer must be the payer');
}
