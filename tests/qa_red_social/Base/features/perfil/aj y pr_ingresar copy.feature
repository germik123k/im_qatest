#PARAMS: {"usuario":"7", "pass":""}

Feature: Ingresar a Ajustes y Privacidad

  Scenario: El usuario ingresa a ajustes y privacidad
    Given que el usuario navega a "https://intramed-front-qa.conexa.ai"
    When el usuario hace click en "Iniciar sesión" button
    And luego de unos segundos ingresas sus credenciales
    And y realiza click en "Iniciar sesión"
    And y puede visualizar la imagen de su perfil
    And el usuario modifica la URL a "https://intramed-front-qa.conexa.ai/profile/gemikle"    
    Then el usuario espera unos segundos E1
    When el usuario hace click en el botón de edición Configuración de usuario
    Then el usuario espera unos segundos E4

#/html/body/div[2]/div/div/div[2]/div[2]/div/button