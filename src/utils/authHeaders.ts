export const getBasicAuthHeaders = () => {
  const authorizationToken = localStorage.getItem("authorization_token")?.trim();

  return authorizationToken
    ? {
        Authorization: `Basic ${authorizationToken}`,
      }
    : undefined;
};
