#PARAMS: {"urlImagen":"7", "email":"german_mikle@yahoo.com", "password":"Figueredo111."}

Feature: Subir Imagen de Perfil

  Scenario: Usuario sube su imagen de perfil correctamente
    Given que el usuario navega a "https://intramed-front-qa.conexa.ai"
    When el usuario hace click en "Iniciar sesión" button
    And luego de unos segundos ingresas sus credenciales
    And y realiza click en "Iniciar sesión"
    And y puede visualizar la imagen de su perfil
    And el usuario modifica la URL a "https://intramed-front-qa.conexa.ai/profile/gemikle"    
    Then el usuario espera unos segundos E1
    When el usuario hace click en el botón de edición de perfil
    Then el usuario espera unos segundos E2
    When el usuario abre el modal de carga de imagen
    Then el usuario espera unos segundos E3
    When el usuario selecciona la imagen "img_test_.png" desde su escritorio
    And el usuario hace click en el botón guardar
    Then el usuario espera unos segundos E4
