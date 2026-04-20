type UserLike = {
  id?: number | string | null;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  tenant?: string | null;
  tenant_id?: number | null;
  keycloak_id?: string | null;
  admin?: boolean | null;
  root?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export function sanitizeUser(user: UserLike | null | undefined) {
  if (!user) {
    return null;
  }

  return {
    id: user.id ?? null,
    name: user.name ?? null,
    username: user.username ?? null,
    email: user.email ?? null,
    tenant: user.tenant ?? null,
    tenant_id: user.tenant_id ?? null,
    keycloak_id: user.keycloak_id ?? null,
    admin: Boolean(user.admin),
    root: Boolean(user.root),
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}
