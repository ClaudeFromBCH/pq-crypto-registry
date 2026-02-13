import type { Algorithm } from './schema';

export function getSizeColumns(
  algo: Algorithm
): { key: string; label: string }[] {
  if (algo.primitive === 'digital-signature') {
    return [
      { key: 'pk_bytes', label: 'PK' },
      { key: 'sk_bytes', label: 'SK' },
      { key: 'sig_bytes', label: 'Sig' }
    ];
  }
  return [
    { key: 'pk_bytes', label: 'PK' },
    { key: 'sk_bytes', label: 'SK' },
    { key: 'ct_bytes', label: 'CT' },
    { key: 'ss_bytes', label: 'SS' }
  ];
}

export function getRelativeLabels(
  algo: Algorithm
): { key: string; label: string }[] {
  if (algo.primitive === 'digital-signature') {
    return [
      { key: 'keygen', label: 'Keygen' },
      { key: 'sign', label: 'Sign' },
      { key: 'verify', label: 'Verify' }
    ];
  }
  return [
    { key: 'keygen', label: 'Keygen' },
    { key: 'encaps', label: 'Encaps' },
    { key: 'decaps', label: 'Decaps' }
  ];
}

export function getBenchmarkColumns(
  algo: Algorithm
): { key: string; label: string }[] {
  if (algo.primitive === 'digital-signature') {
    return [
      { key: 'keygen_us', label: 'Keygen' },
      { key: 'sign_us', label: 'Sign' },
      { key: 'verify_us', label: 'Verify' }
    ];
  }
  return [
    { key: 'keygen_us', label: 'Keygen' },
    { key: 'encaps_us', label: 'Encaps' },
    { key: 'decaps_us', label: 'Decaps' }
  ];
}
