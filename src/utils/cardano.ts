// Cardano 유틸리티 함수들

/**
 * 16진수 주소를 Bech32 형식으로 변환합니다
 */
export async function hexToBech32Address(hexAddress: string): Promise<string> {
  // 이미 bech32 형식인지 확인
  if (hexAddress.startsWith('addr_test') || hexAddress.startsWith('addr')) {
    return hexAddress;
  }

  try {
    // 동적으로 cardano-serialization-lib 로드
    const CSL = await import('@emurgo/cardano-serialization-lib-browser');

    // 16진수 바이트를 파싱
    const addressBytes = Buffer.from(hexAddress, 'hex');

    // Address 객체로 파싱
    const address = CSL.Address.from_bytes(addressBytes);

    // bech32 형식으로 변환
    return address.to_bech32();
  } catch (error) {
    console.error('주소 변환 실패:', error);
    throw new Error('주소 변환에 실패했습니다');
  }
}

/**
 * Bech32 주소가 유효한 형식인지 확인합니다
 */
export function isValidBech32Address(address: string): boolean {
  const network = process.env.NEXT_PUBLIC_NETWORK?.toLowerCase() || 'preview';
  const prefix = network === 'mainnet' ? 'addr' : 'addr_test';

  return address.startsWith(prefix + '1') && address.length > 50;
}

/**
 * 주소를 API 호출에 적합한 형식으로 변환합니다
 */
export async function formatAddressForAPI(address: string): Promise<string> {
  // 이미 올바른 형식인지 확인
  if (isValidBech32Address(address)) {
    return address;
  }

  // 16진수 형식이면 bech32로 변환
  if (/^[0-9a-fA-F]+$/.test(address) && address.length > 50) {
    return await hexToBech32Address(address);
  }

  // 알 수 없는 형식이면 그대로 반환
  return address;
}

/**
 * 주소를 화면 표시용으로 축약합니다
 */
export function truncateAddress(
  address: string,
  prefixLength: number = 12,
  suffixLength: number = 12
): string {
  if (address.length <= prefixLength + suffixLength + 3) {
    return address;
  }

  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

/**
 * ADA 금액을 포맷팅합니다
 */
export function formatADA(amount: number, decimals: number = 6): string {
  return amount.toFixed(decimals) + ' ADA';
}

/**
 * 큰 숫자를 압축 형태로 포맷팅합니다 (예: 1,000 -> 1K, 1,000,000 -> 1M)
 */
export function formatCompactNumber(num: number, decimals: number = 2): string {
  if (num === 0) return '0';

  const units = ['', 'K', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(Math.abs(num)) / 3);

  if (unitIndex === 0) {
    return num.toLocaleString('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  if (unitIndex >= units.length) {
    return num.toExponential(decimals);
  }

  const scaledNum = num / Math.pow(1000, unitIndex);
  return scaledNum.toFixed(decimals) + units[unitIndex];
}

/**
 * ADA 금액을 스마트하게 포맷팅합니다
 */
export function formatSmartADA(amount: number): string {
  if (amount < 1000) {
    return amount.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return formatCompactNumber(amount, 1);
}

/**
 * 트랜잭션 해시를 축약합니다
 */
export function truncateHash(
  hash: string,
  prefixLength: number = 8,
  suffixLength: number = 8
): string {
  if (hash.length <= prefixLength + suffixLength + 3) {
    return hash;
  }

  return `${hash.substring(0, prefixLength)}...${hash.substring(hash.length - suffixLength)}`;
}
