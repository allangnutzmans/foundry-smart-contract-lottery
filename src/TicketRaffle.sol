// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { RaffleBase } from "./RaffleBase.sol";

/**
 * MultiTicketRaffle
 *
 * Regras principais:
 * - Cada player pode comprar até MAX_TICKETS_PER_PLAYER (5) por round.
 * - Os preços por ticket crescem segundo PRICE_BPS (basis points).
 *   Ex: PRICE_BPS = [10000, 15000, 20000, 25000, 30000] (onde 10000 = 100%).
 * - Para calcular o custo total de n tickets (a partir do ticket k+1 até k+n)
 *   usamos um prefix-sum (PRICE_PREFIX_BPS) para computar soma em O(1).
 *
 * Observação sobre seleção do vencedor:
 * - Para manter compatibilidade com RaffleBase que provavelmente escolhe um índice
 *   de players (VRF -> index), armazenamos uma entrada por ticket em s_players
 *   (isto é, repetimos o address tantas vezes quantos tickets comprou).
 * - Essa repetição é segura porque max 5 entradas por tx por player; se quiser
 *   evitar crescimento de s_players e loops na seleção, veja as sugestões offchain
 *   no final do arquivo (Merkle / agregação / commit + serviço off-chain).
 */
contract TicketRaffle is RaffleBase {
  uint8 public constant MAX_TICKETS_PER_PLAYER = 5;

  // basis points per ticket (10000 = 100%)
  uint16[5] private PRICE_BPS = [uint16(10000), uint16(15000), uint16(20000), uint16(25000), uint16(30000)];
  // prefix sums of PRICE_BPS in basis points: PRICE_PREFIX_BPS[0] = 0
  uint32[6] private PRICE_PREFIX_BPS;

  // tickets owned by player for a given round
  mapping(uint256 => mapping(address => uint8)) private s_ticketsByRound;

  // total tickets in a given round (equivalente ao players.length se cada ticket = 1 entrada)
  mapping(uint256 => uint256) private s_totalTicketsByRound;

  event TicketsPurchased(address indexed buyer, uint256 indexed roundId, uint8 bought, uint8 totalForPlayer);
  event TicketsRefunded(address indexed buyer, uint256 indexed roundId, uint8 refunded);

  constructor(
    uint256 entranceFee,
    uint256 interval,
    address vrfCoordinator,
    bytes32 gasLane,
    uint256 subscriptionId,
    uint32 callbackGasLimit
  ) RaffleBase(entranceFee, interval, vrfCoordinator, gasLane, subscriptionId, callbackGasLimit) {
    // precompute prefix sums for BPS (executa só uma vez no deploy)
    PRICE_PREFIX_BPS[0] = 0;
    for (uint256 i = 0; i < PRICE_BPS.length; i++) {
      PRICE_PREFIX_BPS[i + 1] = PRICE_PREFIX_BPS[i] + PRICE_BPS[i];
    }
  }

  /**
   * buyTickets
   * - count: quantos tickets quer comprar agora (1..5)
   * - valida que não ultrapassa MAX_TICKETS_PER_PLAYER por round
   * - calcula o custo total em O(1) usando prefix sums
   * - registra entradas no array de players (cada ticket = 1 push),
   *   isso é necessário se o RaffleBase sorteia por índice em s_players.
   */
  function buyTickets(uint8 count) external payable onlyOpen {
    require(count >= 1, "Must buy at least 1 ticket");
    require(count <= MAX_TICKETS_PER_PLAYER, "Too many tickets in single call");

    uint256 roundId = getRoundId();
    uint8 current = s_ticketsByRound[roundId][msg.sender];
    require(current + count <= MAX_TICKETS_PER_PLAYER, "Exceeds max tickets per player this round");

    // calcula bps total: prefix[current + count] - prefix[current]
    uint32 bpsBefore = PRICE_PREFIX_BPS[uint256(current)];
    uint32 bpsAfter = PRICE_PREFIX_BPS[uint256(current + count)];
    uint32 totalBps = bpsAfter - bpsBefore; // soma dos BPS para os tickets comprados agora

    // calcula totalFee = entranceFee * totalBps / 10000
    uint256 base = getEntranceFee();
    uint256 totalFee = (base * uint256(totalBps)) / 10000;

    require(msg.value == totalFee, "Incorrect ETH sent for tickets");

    // registra tickets: adiciona uma entrada por ticket no array de players do base
    // OBS: assumimos que RaffleBase tem `address[] internal s_players;`
    // Se no seu RaffleBase o array interno tiver outro nome, ajuste aqui.
    for (uint8 i = 0; i < count; i++) {
      // push no players array do base para que a seleção por índice funcione
      s_players[s_roundId][s_playerCount++] = payable(msg.sender);
    }

    // atualiza contador de tickets por jogador e total de tickets no round
    s_ticketsByRound[roundId][msg.sender] = current + count;
    s_totalTicketsByRound[roundId] += count;

    emit TicketsPurchased(msg.sender, roundId, count, current + count);
  }

  /**
   * getTicketCountForPlayer
   */
  function getTicketCountForPlayer(uint256 roundId, address player) external view returns (uint8) {
    return s_ticketsByRound[roundId][player];
  }

  /**
   * getTotalTicketsInRound
   */
  function getTotalTicketsInRound(uint256 roundId) external view returns (uint256) {
    return s_totalTicketsByRound[roundId];
  }

  /**
   * getNextTicketPriceForPlayer
   * Retorna o preço (em wei) para o próximo ticket do player nesta rodada
   */
  function getNextTicketPriceForPlayer(address player) public view returns (uint256) {
    uint256 roundId = getRoundId();
    uint8 current = s_ticketsByRound[roundId][player];
    require(current < MAX_TICKETS_PER_PLAYER, "No more tickets allowed");
    uint16 bps = PRICE_BPS[uint256(current)]; // preço do próximo ticket
    uint256 base = getEntranceFee();
    return (base * uint256(bps)) / 10000;
  }

  /** 
   * Overwrites simples para manter compatibilidade com a interface pública de SingleEntryRaffle.
   * As funções abaixo redirecionam para a implementação do base.
   */
  function enterRaffle() public payable override onlyOpen paysEnough {
    // Para compatibilidade, comporta-se como comprar 1 ticket com a lógica de preços progressivos.
    // Calculate the correct price for the first ticket for this player
    uint256 roundId = getRoundId();
    uint8 current = s_ticketsByRound[roundId][msg.sender];
    require(current < MAX_TICKETS_PER_PLAYER, "Exceeds max tickets per player this round");
    
    uint32 bpsBefore = PRICE_PREFIX_BPS[uint256(current)];
    uint32 bpsAfter = PRICE_PREFIX_BPS[uint256(current + 1)];
    uint32 totalBps = bpsAfter - bpsBefore;
    
    uint256 base = getEntranceFee();
    uint256 expectedFee = (base * uint256(totalBps)) / 10000;
    
    require(msg.value == expectedFee, "Incorrect ETH sent for next ticket");
    
    // Add player entry
    s_players[s_roundId][s_playerCount++] = payable(msg.sender);
    
    // Update ticket counts
    s_ticketsByRound[roundId][msg.sender] = current + 1;
    s_totalTicketsByRound[roundId] += 1;
    
    emit RaffleEntered(msg.sender);
    emit TicketsPurchased(msg.sender, roundId, 1, current + 1);
  }

  function checkUpkeep(bytes memory checkData) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
    return super.checkUpkeep(checkData);
  }

  function performUpkeep(bytes calldata performData) public override {
    super.performUpkeep(performData);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
    super.fulfillRandomWords(requestId, randomWords);
  }

  /* ---------- NOTE SOBRE LIMPEZA ENTRE ROUNDS ---------- */
  // É importante que o RaffleBase faça o "reset" do array s_players e do estado
  // quando um novo round começa. Aqui estamos armazenando por round: s_ticketsByRound[roundId],
  // e s_totalTicketsByRound[roundId] para evitar confusão entre rounds.
  // Se seu RaffleBase limpar s_players automaticamente entre rounds, está tudo certo.
  /* ----------------------------------------------------- */
}
