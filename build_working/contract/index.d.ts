import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Proposal = { proposalId: bigint;
                         recipient: { is_left: boolean,
                                      left: { bytes: Uint8Array },
                                      right: { bytes: Uint8Array }
                                    };
                         amount: bigint;
                         deadline: bigint;
                         isActive: boolean;
                         yesVotes: bigint;
                         noVotes: bigint
                       };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getBalance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  registerMember(context: __compactRuntime.CircuitContext<PS>, weight_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 recipient_0: { is_left: boolean,
                                left: { bytes: Uint8Array },
                                right: { bytes: Uint8Array }
                              },
                 amount_0: bigint,
                 deadline_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  voteYes(context: __compactRuntime.CircuitContext<PS>, proposalId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  voteNo(context: __compactRuntime.CircuitContext<PS>, proposalId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  executeProposal(context: __compactRuntime.CircuitContext<PS>,
                  proposalId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getProposal(context: __compactRuntime.CircuitContext<PS>, proposalId_0: bigint): __compactRuntime.CircuitResults<PS, Proposal>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getBalance(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  registerMember(context: __compactRuntime.CircuitContext<PS>, weight_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  createProposal(context: __compactRuntime.CircuitContext<PS>,
                 recipient_0: { is_left: boolean,
                                left: { bytes: Uint8Array },
                                right: { bytes: Uint8Array }
                              },
                 amount_0: bigint,
                 deadline_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  voteYes(context: __compactRuntime.CircuitContext<PS>, proposalId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  voteNo(context: __compactRuntime.CircuitContext<PS>, proposalId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  executeProposal(context: __compactRuntime.CircuitContext<PS>,
                  proposalId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getProposal(context: __compactRuntime.CircuitContext<PS>, proposalId_0: bigint): __compactRuntime.CircuitResults<PS, Proposal>;
}

export type Ledger = {
  readonly treasuryBalance: bigint;
  proposals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Proposal;
    [Symbol.iterator](): Iterator<[bigint, Proposal]>
  };
  readonly nextProposalId: bigint;
  memberWeights: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: { is_left: boolean,
                    left: { bytes: Uint8Array },
                    right: { bytes: Uint8Array }
                  }): boolean;
    lookup(key_0: { is_left: boolean,
                    left: { bytes: Uint8Array },
                    right: { bytes: Uint8Array }
                  }): bigint;
    [Symbol.iterator](): Iterator<[{ is_left: boolean, left: { bytes: Uint8Array }, right: { bytes: Uint8Array } }, bigint]>
  };
  hasVoted: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): {
      isEmpty(): boolean;
      size(): bigint;
      member(key_1: { is_left: boolean,
                      left: { bytes: Uint8Array },
                      right: { bytes: Uint8Array }
                    }): boolean;
      lookup(key_1: { is_left: boolean,
                      left: { bytes: Uint8Array },
                      right: { bytes: Uint8Array }
                    }): boolean;
      [Symbol.iterator](): Iterator<[{ is_left: boolean, left: { bytes: Uint8Array }, right: { bytes: Uint8Array } }, boolean]>
    }
  };
  readonly quorumThreshold: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initialBalance_0: bigint,
               quorum_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
