function getEnvVar(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL', 'https://801outlet.com'),
  phoneE164: getEnvVar('NEXT_PUBLIC_PHONE_E164', '+13852016328'),

  getPhoneHref: () => `tel:${env.phoneE164.replace(/[^+\d]/g, '')}`,
} as const;
