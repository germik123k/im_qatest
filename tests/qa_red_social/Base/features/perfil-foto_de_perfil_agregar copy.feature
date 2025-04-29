Feature: Subir Imagen de Perfil

  Scenario: Usuario sube su imagen de perfil correctamente
    Given que el usuario navega a "https://www.intramed.net"
    When el usuario hace click en "Iniciar sesión" button
    And luego de unos segundos ingresas sus credenciales
    And y realiza click en "Iniciar sesión"
    And y puede visualizar la imagen de su perfil
    And el usuario modifica la URL a "https://intramed-front-qa.conexa.ai/profile/gemikle"
    
    Then el usuario espera 4 segundos
    When el usuario hace click en el botón de edición de perfil
    Then el usuario espera 4 segundos
    When el usuario abre el modal de carga de imagen
    And el usuario hace click en la zona de carga de imagen
    Then el usuario espera 3 segundos
    When el usuario selecciona la imagen "img_test_.png" desde su escritorio
    Then el usuario espera 4 segundos
