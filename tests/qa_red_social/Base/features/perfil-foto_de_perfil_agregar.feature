Feature: foto de perfil agregar

Scenario: Hacer login en Intramed
  Given que el usuario navega a "https://www.intramed.net"
  When el usuario hace click en "Iniciar sesión" button
  And luego de unos segundos ingresas sus credenciales
  And y realiza click en "Iniciar sesión"
  Then el usuario espera unos segundos
  And y puede visualizar la imagen de su perfil de vuelta en la home

  