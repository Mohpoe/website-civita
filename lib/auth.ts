/**
 * Helper identitas user.
 *
 * Sebelumnya kode memakai `emailAddresses[0]`, yang belum tentu email utama
 * (primary). Akibatnya user dengan beberapa email bisa "kehilangan" riwayat
 * pembeliannya. Gunakan email primary, dengan fallback ke email pertama yang
 * terverifikasi.
 */
interface ClerkUserLike {
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses: { emailAddress: string; id: string }[];
  primaryEmailAddressId?: string | null;
}

export function getPrimaryEmail(
  user: ClerkUserLike | null | undefined,
): string | null {
  if (!user) return null;

  const primaryFromId = user.primaryEmailAddressId
    ? user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
    : undefined;

  return (
    user.primaryEmailAddress?.emailAddress ||
    primaryFromId?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    null
  );
}
