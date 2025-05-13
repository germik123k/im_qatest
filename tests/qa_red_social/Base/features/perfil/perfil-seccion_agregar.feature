#PARAMS: {"seccion":"Residencia", "email":"german_mikle@yahoo.com", "password":"Figueredo111."}

Feature: Agregar sección al perfil

  Scenario: Usuario edita su descripción correctamente
    Given que el usuario navega a "https://intramed-front-qa.conexa.ai"
    When el usuario hace click en "Iniciar sesión" button
    And luego de unos segundos ingresas sus credenciales
    And y realiza click en "Iniciar sesión"
    And y puede visualizar la imagen de su perfil
    And el usuario modifica la URL a "https://intramed-front-qa.conexa.ai/profile/gemikle"    
    Then el usuario espera unos segundos E1

    When el usuario hace click en el botón de agregar sección correspondiente
    Then se abre un modal con un formulario
    And el usuario espera unos segundos E2

    When el usuario llena los campos del formulario y confirma la acción
    Then el modal se cierra
    And se observa la sección agregada en su perfil

  
