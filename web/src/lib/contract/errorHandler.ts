export const TxError: Record<string, string> = {
  Raffle__AlreadyEntered: 'You have already entered the raffle! One entry per wallet.',
  Raffle__SendMoreToEnterRaffle: 'You need to send more ETH to enter the raffle.',
  Raffle__TransferFailed: 'The transfer of funds failed.',
  Raffle_RaffleNotOpen: 'The raffle is not open right now.',
  Raffle_UpkeepNotNeeded: 'Upkeep not needed: balance, participants or state invalid.',
};
