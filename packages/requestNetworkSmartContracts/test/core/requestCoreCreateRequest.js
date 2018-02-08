var config = require("../config.js");
var utils = require("../utils.js");
if(!config['all'] && !config[__filename.split('\\').slice(-1)[0]]) {
	return;
}
var RequestCore = artifacts.require("./core/RequestCore.sol");
var RequestBurnManagerSimple = artifacts.require("./collect/RequestBurnManagerSimple.sol");
var BigNumber = require('bignumber.js');


contract('RequestCore Create Request', function(accounts) {
	var admin = accounts[0];
	var otherguy = accounts[1];
	var fakeContract = accounts[2];
	var payer = accounts[3];
	var payee = accounts[4];
	var creator = accounts[5];
	var fakeExtention1 = accounts[6];
	var fakeExtention2 = accounts[7];
	var contractForBurning = accounts[8];

	var arbitraryAmount = 100000000;
/*
	// gas gas gas gas gas
	// new request without extensions
	it("new request without extensions", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});
		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});

		// createRequest(address _creator, address[] _payees, int256[] _expectedAmounts, address _payer, address _extension, string _data)

		var r = await requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 1 """"""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');


		var r = await requestCore.createRequest(creator, [payee,otherguy], [arbitraryAmount,arbitraryAmount/2], payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 2 """"""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');

		var r = await requestCore.createRequest(creator, [payee,otherguy, fakeExtention1], [arbitraryAmount,arbitraryAmount/2,arbitraryAmount/2], payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 3 """"""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');

		var r = await requestCore.createRequest(creator, [payee,otherguy, fakeExtention1, fakeExtention2], [arbitraryAmount,arbitraryAmount/2,arbitraryAmount/2,arbitraryAmount/2], payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 4 """"""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');

		let payeesAdr = [];
		let payeesAmount = [];
		for(i=0;i<10;i++) {
			payeesAdr.push(payee);
			payeesAmount.push(arbitraryAmount);
		}
		var r = await requestCore.createRequest(creator, payeesAdr, payeesAmount, payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 10""""""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');

		payeesAdr = [];
		payeesAmount = [];
		for(i=0;i<50;i++) {
			payeesAdr.push(payee);
			payeesAmount.push(arbitraryAmount);
		}
		var r = await requestCore.createRequest(creator, payeesAdr, payeesAmount, payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 50""""""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');

		payeesAdr = [];
		payeesAmount = [];
		for(i=0;i<100;i++) {
			payeesAdr.push(payee);
			payeesAmount.push(arbitraryAmount);
		}
		var r = await requestCore.createRequest(creator, payeesAdr, payeesAmount, payer, 0, "", {from:fakeContract});
		console.log('""""""""""""""""""""""""""""""""""createRequest 100""""""""""""""""""""""""""""""""""');
		console.log(r.receipt.gasUsed);
		console.log('""""""""""""""""""""""""""""""""""createRequest""""""""""""""""""""""""""""""""""');
	});
*/

	// requestId start at 1 when Core is created
	it("Creation Core, requestId start at 0", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});

		assert.equal(await requestCore.numRequests.call(),"0","RequestId start by 0");
	});

	// new request from non trustable sender (contract trusted) impossible
	it("request from non trustable sender (contract trusted) impossible", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});

		await utils.expectThrow(requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, 0, "", {from:fakeContract}));
	});

	// impossible to createRequest if Core Paused
	it("impossible to createRequest if Core Paused", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});

		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});
		await requestCore.pause({from:admin});

		await utils.expectThrow(requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, 0, "", {from:fakeContract}));
	});

	// new request _creator==0 impossible
	// new request payee==0 OK
	// new request payer==0 OK
	// new request payee==payer OK
	it("Actors not null and payee!=payer", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});


		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});

		// new request _creator==0 impossible
		await utils.expectThrow(requestCore.createRequest(0, [payee], [arbitraryAmount], payer, 0, "", {from:fakeContract}));

		// new request payee==0 OK
		var r = await requestCore.createRequest(creator, [], [], payer, 0, "", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,0,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payer,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],0,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],0,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		var r = await requestCore.setPayee(utils.getRequestId(requestCore.address,1), payee, {from:fakeContract});
		assert.equal(r.logs[0].event,"UpdatePayee","Event is missing after setPayee()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"wrong args payee");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],0,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		// new request payer==0 OK
		r = await requestCore.createRequest(creator, [payee], [arbitraryAmount], 0, 0, "", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,2),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,0,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,2));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],0,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");


		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		var r = await requestCore.setPayer(utils.getRequestId(requestCore.address,2), payer, {from:fakeContract});
		assert.equal(r.logs[0].event,"UpdatePayer","Event is missing after setPayer()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,2),"wrong args requestId");
		assert.equal(r.logs[0].args.payer,payer,"wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,2));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		// new request payee==payer OK
		r = await requestCore.createRequest(creator, [payee], [arbitraryAmount], payee, 0, "", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,3),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payee,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,3));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payee,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		
	});


	// new request _expectedAmount == 0 OK
	// new request _expectedAmount > 2^256 impossible
	it("expectedAmount == 0 and > 2^255", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});


		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});

		var r = await requestCore.createRequest(creator, [payee], [0], payer, 0, "", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payer,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],0,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		var r = await requestCore.updateExpectedAmount(utils.getRequestId(requestCore.address,1), 0, arbitraryAmount, {from:fakeContract});
		assert.equal(r.logs[0].event,"UpdateExpectedAmount","Event is missing after setExpectedAmount()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"wrong args requestId");
		assert.equal(r.logs[0].args.deltaAmount,arbitraryAmount,"wrong args arbitraryAmount");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		await utils.expectThrow(requestCore.createRequest(creator, [payee], [new BigNumber(2).pow(256)], payer, 0, "", {from:fakeContract}));
	});
	// new request _expectedAmount < 0 OK
	// new request _expectedAmount > -2^256 impossible
	it("expectedAmount < 0 and > -2^255", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});


		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});

		var r = await requestCore.createRequest(creator, [payee], [-arbitraryAmount], payer, 0, "", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payer,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],-arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		await utils.expectThrow(requestCore.createRequest(creator, [payee], [new BigNumber(-2).pow(256)], payer, 0, "", {from:fakeContract}));
	});


	// new request without extensions
	it("new request without extensions", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});

		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});
		await requestCore.adminAddTrustedExtension(fakeExtention1, {from:admin});

		var r = await requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, 0, "", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payer,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");


		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		

		var newReqExtension = await requestCore.getExtension.call(utils.getRequestId(requestCore.address,1));
		assert.equal(newReqExtension,0,"new request wrong data : Extension[0]");


		var r = await requestCore.setExtension(utils.getRequestId(requestCore.address,1), fakeExtention1, {from:fakeContract});
		assert.equal(r.logs[0].event,"UpdateExtension","Event is missing after setExtension()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"wrong args requestId");
		assert.equal(r.logs[0].args.extension,fakeExtention1,"wrong args extension");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],fakeExtention1,"new request wrong data : extension");
	});

	// new request with data
	it("new request without extensions", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});

		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});

		var r = await requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, 0, "QmSbfaY3FRQQNaFx8Uxm6rRKnqwu8s9oWGpRmqgfTEgxWz", {from:fakeContract});
		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId, utils.getRequestId(requestCore.address,1),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payer,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"QmSbfaY3FRQQNaFx8Uxm6rRKnqwu8s9oWGpRmqgfTEgxWz","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],0,"new request wrong data : extension");
		// assert.equal(newReq[8],"QmSbfaY3FRQQNaFx8Uxm6rRKnqwu8s9oWGpRmqgfTEgxWz","new request wrong data : data");

		var newReqExtension = await requestCore.getExtension.call(utils.getRequestId(requestCore.address,1));
		assert.equal(newReqExtension,0,"new request wrong data : Extension[0]");
	});
	// new request with 1 extension trusted
	it("new request with 1 extension valid", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});

		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});
		await requestCore.adminAddTrustedExtension(fakeExtention1, {from:admin});

		var r = await requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, fakeExtention1, "", {from:fakeContract});

		assert.equal(r.logs[0].event,"Created","Event Created is missing after createRequest()");
		assert.equal(r.logs[0].args.requestId,utils.getRequestId(requestCore.address,1),"Event Created wrong args requestId");
		assert.equal(r.logs[0].args.payee,payee,"Event Created wrong args payee");
		assert.equal(r.logs[0].args.payer,payer,"Event Created wrong args payer");
		assert.equal(r.logs[0].args.creator,creator,"Event Created wrong args creator");
		assert.equal(r.logs[0].args.data,"","Event Created wrong args payer");

		var newReq = await requestCore.requests.call(utils.getRequestId(requestCore.address,1));
		
		assert.equal(newReq[4],payee,"new request wrong data : payee");
		assert.equal(newReq[0],payer,"new request wrong data : payer");
		assert.equal(newReq[5],arbitraryAmount,"new request wrong data : expectedAmount");
		assert.equal(newReq[1],fakeContract,"new request wrong data : currencyContract");
		assert.equal(newReq[6],0,"new request wrong data : balance");
		assert.equal(newReq[2],0,"new request wrong data : state");
		assert.equal(newReq[3],fakeExtention1,"new request wrong data : extension");
		


		var newReqExtension = await requestCore.getExtension.call(utils.getRequestId(requestCore.address,1));
		assert.equal(newReqExtension,fakeExtention1,"new request wrong data : Extension");
	});


	// new request with 1 extension not trusted
	it("new request with 1 extension not trusted", async function () {
		var requestCore = await RequestCore.new();
		var requestBurnManagerSimple = await RequestBurnManagerSimple.new(0);
		await requestCore.setBurnManager(requestBurnManagerSimple.address, {from:admin});


		await requestCore.adminAddTrustedCurrencyContract(fakeContract, {from:admin});

		await utils.expectThrow(requestCore.createRequest(creator, [payee], [arbitraryAmount], payer, fakeExtention1, "", {from:fakeContract}));
	});
	
});


