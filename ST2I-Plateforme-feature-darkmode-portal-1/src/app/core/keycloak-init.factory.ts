import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'pfe-realm',
  clientId: 'angular-portal',
});

export function initializeKeycloak(): () => Promise<boolean> {
  return () =>
    keycloak
      .init({
        onLoad: 'login-required',
        redirectUri: 'http://localhost:4200/portal',
        checkLoginIframe: false, 
      })
      .then((authenticated) => {
        console.log('Keycloak authenticated:', authenticated);
        return authenticated;
      })
      .catch((err) => {
        console.error('Keycloak init failed:', err);
        return false;
      });
}