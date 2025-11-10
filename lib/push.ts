export type ExpoPushToken = { token: string; platform: 'ios'|'android'|'web' };
export async function getExpoPushToken(): Promise<ExpoPushToken | null> {
  return null;
}
