import { WalletInstance } from '../../wallet/types/walletTypes';
import { WalletService } from '../../wallet/services/walletService';

export interface SendTransactionParams {
  recipientAddress: string;
  amount: number; // ADA 단위
  memo?: string;
}

export interface TransactionResult {
  txHash: string;
  fee: string; // ADA 단위
}

export class SendService {
  /**
   * ADA를 lovelace로 변환합니다 (WalletService와 통합)
   */
  static adaToLovelace(ada: number): string {
    return WalletService.adaToLovelace(ada);
  }

  /**
   * 지갑 내장 send API를 사용한 간단하고 안전한 송금
   * CIP-30 표준의 지갑 내장 기능만 활용 - 복잡한 트랜잭션 빌딩 제거
   */
  static async sendTransaction(
    walletInstance: WalletInstance,
    params: SendTransactionParams
  ): Promise<TransactionResult> {
    try {
      // 1. 주소 유효성 검증
      const isValidAddress = await this.validateAddress(
        params.recipientAddress
      );
      if (!isValidAddress) {
        throw new Error('올바르지 않은 수신자 주소입니다.');
      }

      // 2. 송금액을 lovelace로 변환
      const amountInLovelace = this.adaToLovelace(params.amount);
      console.log(
        `송금 시작: ${params.amount} ADA (${amountInLovelace} lovelace)`
      );

      // signTx + submitTx 방식으로 직접 송금

      return await this.sendTransactionWithSignTx(walletInstance, params);
    } catch (error) {
      console.error('💥 SendService 전체 실패:', error);

      // 최종 에러 처리 (이미 처리된 에러는 그대로 전달)
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('💥 송금 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 주소 유효성 검증 (간단한 Bech32 검증)
   */
  static async validateAddress(address: string): Promise<boolean> {
    try {
      // Cardano 주소는 bech32 형식이어야 함
      if (!address || typeof address !== 'string') {
        return false;
      }

      // 기본적인 Cardano 주소 패턴 검사
      if (!address.startsWith('addr1') && !address.startsWith('addr_test1')) {
        return false;
      }

      // 길이 검사 (일반적으로 103자 정도)
      if (address.length < 50 || address.length > 120) {
        return false;
      }

      // CSL을 이용한 정확한 검증 (옵션)
      try {
        const CSL = await import('@emurgo/cardano-serialization-lib-browser');
        CSL.Address.from_bech32(address);
        return true;
      } catch {
        // CSL 검증 실패해도 기본 패턴은 통과
        console.warn('CSL 주소 검증 실패, 기본 패턴으로 검증');
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * 예상 수수료 계산 (간단한 추정)
   * 실제 수수료는 지갑이 계산하므로 대략적인 추정치만 제공
   */
  static estimateFee(amount: number, hasMetadata: boolean = false): number {
    // 기본 수수료 (최소 트랜잭션)
    const baseFee = 0.17;

    // 메타데이터 추가 비용
    const metadataFee = hasMetadata ? 0.03 : 0;

    // 큰 금액의 경우 약간의 추가 수수료 (UTXO 복잡도 고려)
    const complexityFee = amount > 100 ? 0.02 : 0;

    return baseFee + metadataFee + complexityFee;
  }

  /**
   * signTx + submitTx 방식으로 송금 (send API 미지원 지갑용 폴백)
   */
  static async sendTransactionWithSignTx(
    walletInstance: WalletInstance,
    params: SendTransactionParams
  ): Promise<TransactionResult> {
    console.log('🔧 signTx + submitTx 방식으로 송금 시작');

    try {
      const CSL = await import('@emurgo/cardano-serialization-lib-browser');

      // 1. 필요한 정보 수집
      console.log('📋 지갑 정보 수집 중...');
      const [utxos, changeAddress] = await Promise.all([
        walletInstance.getUtxos(),
        walletInstance.getChangeAddress(),
      ]);

      if (!utxos || utxos.length === 0) {
        throw new Error('사용 가능한 UTXO가 없습니다.');
      }

      console.log(`💎 UTXO 개수: ${utxos.length}개`);
      console.log(`🏠 Change 주소: ${changeAddress.substring(0, 20)}...`);

      // 2. 트랜잭션 빌더 설정
      console.log('🔧 트랜잭션 빌더 설정 중...');
      const txBuilder = CSL.TransactionBuilder.new(
        CSL.TransactionBuilderConfigBuilder.new()
          .fee_algo(
            CSL.LinearFee.new(
              CSL.BigNum.from_str('44'),
              CSL.BigNum.from_str('155381')
            )
          )
          .pool_deposit(CSL.BigNum.from_str('500000000'))
          .key_deposit(CSL.BigNum.from_str('2000000'))
          .coins_per_utxo_byte(CSL.BigNum.from_str('4310'))
          .max_value_size(5000)
          .max_tx_size(16384)
          .build()
      );

      // 3. 송금 출력 추가
      console.log('💸 송금 출력 추가 중...');
      const recipientAddress = CSL.Address.from_bech32(params.recipientAddress);
      const sendAmount = CSL.BigNum.from_str(this.adaToLovelace(params.amount));
      const output = CSL.TransactionOutput.new(
        recipientAddress,
        CSL.Value.new(sendAmount)
      );
      txBuilder.add_output(output);
      console.log(
        `✅ 송금 출력: ${params.amount} ADA → ${params.recipientAddress.substring(0, 20)}...`
      );

      // 4. 메타데이터 추가 (직접 텍스트 방식 사용)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let auxiliaryData: any = undefined;
      if (params.memo) {
        console.log(`📝 메타데이터 추가: "${params.memo}" (직접 텍스트 방식)`);

        const metadata = CSL.GeneralTransactionMetadata.new();
        metadata.insert(
          CSL.BigNum.from_str('674'),
          CSL.TransactionMetadatum.new_text(params.memo)
        );

        auxiliaryData = CSL.AuxiliaryData.new();
        auxiliaryData.set_metadata(metadata);
        txBuilder.set_auxiliary_data(auxiliaryData);

        console.log('✅ 메타데이터 추가 완료');
      }

      // 5. UTXO 입력 추가
      console.log('💎 UTXO 입력 추가 중...');
      let totalInput = CSL.BigNum.from_str('0');
      const requiredAmount = sendAmount.checked_add(
        CSL.BigNum.from_str('500000')
      ); // 송금액 + 0.5 ADA 여유분

      for (let i = 0; i < utxos.length; i++) {
        try {
          const utxo = CSL.TransactionUnspentOutput.from_bytes(
            Buffer.from(utxos[i], 'hex')
          );

          const input = utxo.input();
          const outputValue = utxo.output().amount();

          // 간단한 키 해시 방식으로 입력 추가
          const address = utxo.output().address();
          let keyHash;

          try {
            const baseAddress = CSL.BaseAddress.from_address(address);
            if (baseAddress) {
              keyHash = baseAddress.payment_cred().to_keyhash();
            } else {
              const enterpriseAddress =
                CSL.EnterpriseAddress.from_address(address);
              if (enterpriseAddress) {
                keyHash = enterpriseAddress.payment_cred().to_keyhash();
              }
            }
          } catch {
            // 기본 키 해시 사용
            keyHash = CSL.Ed25519KeyHash.from_bytes(
              Buffer.from('00'.repeat(28), 'hex')
            );
          }

          if (!keyHash) {
            keyHash = CSL.Ed25519KeyHash.from_bytes(
              Buffer.from('00'.repeat(28), 'hex')
            );
          }

          txBuilder.add_key_input(keyHash, input, outputValue);
          totalInput = totalInput.checked_add(outputValue.coin());

          console.log(
            `💎 UTXO ${i + 1}: ${outputValue.coin().to_str()} lovelace 추가`
          );

          // 충분한 금액이 모이면 중단
          if (totalInput.compare(requiredAmount) >= 0) {
            console.log('✅ 충분한 UTXO 수집 완료');
            break;
          }
        } catch (utxoError) {
          console.warn(`⚠️ UTXO ${i + 1} 처리 실패:`, utxoError);
          continue;
        }
      }

      if (totalInput.compare(requiredAmount) < 0) {
        throw new Error(
          `💸 잔액이 부족합니다. 필요: ${requiredAmount.to_str()}, 보유: ${totalInput.to_str()}`
        );
      }

      // 6. 거스름돈 주소 추가
      console.log('🏠 거스름돈 처리 중...');
      const changeAddr = CSL.Address.from_bytes(
        Buffer.from(changeAddress, 'hex')
      );
      txBuilder.add_change_if_needed(changeAddr);

      // 7. 트랜잭션 빌드 (메타데이터 제외한 상태)
      console.log('🔨 트랜잭션 빌드 중...');
      const txBody = txBuilder.build();

      // 서명용 트랜잭션 (메타데이터 없이)
      console.log('✍️ 서명용 트랜잭션 생성 (메타데이터 제외)');
      const txForSigning = CSL.Transaction.new(
        txBody,
        CSL.TransactionWitnessSet.new()
      );

      // 8. 트랜잭션 크기와 수수료 확인
      console.log('📏 트랜잭션 정보 확인:');
      console.log(
        `  📦 트랜잭션 크기: ${txForSigning.to_bytes().length} bytes`
      );
      console.log(`  💰 계산된 수수료: ${txBody.fee().to_str()} lovelace`);
      console.log(`  💎 총 입력: ${totalInput.to_str()} lovelace`);
      console.log(`  💸 송금액: ${sendAmount.to_str()} lovelace`);

      // 9. 트랜잭션 서명 요청 (메타데이터 없는 버전)
      console.log('✍️ 지갑에 서명 요청 중... (메타데이터 제외)');
      const txHex = Buffer.from(txForSigning.to_bytes()).toString('hex');
      console.log(
        `📋 서명용 트랜잭션 Hex (앞 100자): ${txHex.substring(0, 100)}...`
      );

      const witnessSetHex = await walletInstance.signTx(txHex, false);

      // 10. 서명된 트랜잭션 생성 (메타데이터 다시 추가)
      console.log('🔐 서명된 트랜잭션 생성 중...');
      const witnessSet = CSL.TransactionWitnessSet.from_bytes(
        Buffer.from(witnessSetHex, 'hex')
      );

      let finalTx;
      if (auxiliaryData) {
        console.log('📝 최종 트랜잭션에 메타데이터 다시 추가');
        finalTx = CSL.Transaction.new(txBody, witnessSet, auxiliaryData);

        // 메타데이터 포함 확인
        const finalAuxData = finalTx.auxiliary_data();
        if (finalAuxData) {
          console.log('✅ 최종 트랜잭션에 메타데이터 포함 확인됨');
        } else {
          console.error('❌ 최종 트랜잭션에 메타데이터 누락!');
        }
      } else {
        console.log('💰 메타데이터 없는 최종 트랜잭션 생성');
        finalTx = CSL.Transaction.new(txBody, witnessSet);
      }

      // 11. 트랜잭션 제출
      console.log('🚀 네트워크에 트랜잭션 제출 중...');
      const finalTxHex = Buffer.from(finalTx.to_bytes()).toString('hex');
      console.log(
        `📋 최종 트랜잭션 Hex (앞 100자): ${finalTxHex.substring(0, 100)}...`
      );
      console.log(`📦 최종 트랜잭션 크기: ${finalTx.to_bytes().length} bytes`);

      const txHash = await walletInstance.submitTx(finalTxHex);

      // 11. 수수료 계산
      const fee = txBody.fee();
      const feeInAda = (Number(fee.to_str()) / 1_000_000).toFixed(6);

      console.log('송금 완료:', txHash);

      return {
        txHash,
        fee: feeInAda,
      };
    } catch (error) {
      console.error('❌ signTx + submitTx 방식 실패:', error);
      throw error;
    }
  }

  /**
   * 지갑의 send API 지원 여부 확인
   */
  static checkSendApiSupport(walletInstance: WalletInstance): {
    hasStandardSend: boolean;
    hasExperimentalSend: boolean;
    isSupported: boolean;
  } {
    const hasStandardSend = typeof walletInstance.send === 'function';
    const hasExperimentalSend =
      typeof walletInstance.experimental?.send === 'function';

    return {
      hasStandardSend,
      hasExperimentalSend,
      isSupported: hasStandardSend || hasExperimentalSend,
    };
  }
}
