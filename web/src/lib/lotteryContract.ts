export const lotteryContract = {
    address: '0xC34ABFB1DAaBCA88Ec6af4bAb642Aa80F2aa489b',
    abi: [{
        "inputs": [{"internalType": "uint256", "name": "entranceFee", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "interval",
            "type": "uint256"
        }, {"internalType": "address", "name": "vrfCoordinator", "type": "address"}, {
            "internalType": "bytes32",
            "name": "gasLane",
            "type": "bytes32"
        }, {"internalType": "uint256", "name": "subscriptionId", "type": "uint256"}, {
            "internalType": "uint32",
            "name": "callbackGasLimit",
            "type": "uint32"
        }], "stateMutability": "nonpayable", "type": "constructor"
    }, {
        "inputs": [{"internalType": "address", "name": "have", "type": "address"}, {
            "internalType": "address",
            "name": "want",
            "type": "address"
        }], "name": "OnlyCoordinatorCanFulfill", "type": "error"
    }, {
        "inputs": [{"internalType": "address", "name": "have", "type": "address"}, {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }, {"internalType": "address", "name": "coordinator", "type": "address"}],
        "name": "OnlyOwnerOrCoordinator",
        "type": "error"
    }, {"inputs": [], "name": "Raffle_RaffleNotOpen", "type": "error"}, {
        "inputs": [{
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "length", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "raffleState",
            "type": "uint256"
        }], "name": "Raffle_UpkeepNotNeeded", "type": "error"
    }, {"inputs": [], "name": "Raffle__SendMoreToEnterRaffle", "type": "error"}, {
        "inputs": [],
        "name": "Raffle__TransferFailed",
        "type": "error"
    }, {"inputs": [], "name": "ZeroAddress", "type": "error"}, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "vrfCoordinator", "type": "address"}],
        "name": "CoordinatorSet",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
        }],
        "name": "OwnershipTransferRequested",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
        }],
        "name": "OwnershipTransferred",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"}],
        "name": "RaffleEntered",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256"}],
        "name": "RequestRaffleWinner",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"}],
        "name": "WinnerPicked",
        "type": "event"
    }, {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
        "name": "checkUpkeep",
        "outputs": [{"internalType": "bool", "name": "upkeepNeeded", "type": "bool"}, {
            "internalType": "bytes",
            "name": "",
            "type": "bytes"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "enterRaffle",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getCallbackGasLimit",
        "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getEntranceFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getGasLane",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getInterval",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getLastTimestamp",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
        "name": "getPlayer",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getRecentWinner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getRflleState",
        "outputs": [{"internalType": "enum Raffle.RaffleState", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getSubscriptionId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getVrfCoordinator",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
        "name": "performUpkeep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "requestId", "type": "uint256"}, {
            "internalType": "uint256[]",
            "name": "randomWords",
            "type": "uint256[]"
        }], "name": "rawFulfillRandomWords", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs": [],
        "name": "s_vrfCoordinator",
        "outputs": [{"internalType": "contract IVRFCoordinatorV2Plus", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_vrfCoordinator", "type": "address"}],
        "name": "setCoordinator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }] as const
}