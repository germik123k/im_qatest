#PARAMS: {"seccion":"Docencia", consectetur adipiscing elit.","otroVal":"12345"}

Feature: Editar la sección "Sobre mí"

  Scenario: Usuario edita su descripción correctamente
    Given que el usuario navega a "https://intramed-front-qa.conexa.ai"
    When el usuario hace click en "Iniciar sesión" button
    And luego de unos segundos ingresas sus credenciales
    And y realiza click en "Iniciar sesión"
    And y puede visualizar la imagen de su perfil
    And el usuario modifica la URL a "https://intramed-front-qa.conexa.ai/profile/gemikle"    
    Then el usuario espera unos segundos E1
    When el usuario hace click en el botón de edición de "Sobre mí"
    Then el usuario espera unos segundos E2
    When el usuario escribe un texto en el campo de edición "Sobre mí"
    Then el usuario espera unos segundos E3
    When el usuario hace click en el botón "Guardar cambios"
    Then el usuario espera unos segundos E4
    Then el usuario verifica que el texto ingresado se muestra correctamente en la sección "Sobre mí"
