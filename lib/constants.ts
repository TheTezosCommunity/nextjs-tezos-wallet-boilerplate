export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'ghostnet';
export const ENV: 'dev' | 'prod' = NETWORK === 'ghostnet' ? 'dev' : 'prod';
