module.exports = {
  default: {
    //require: ['./tests/prod_actual/Base/step-definitions/*.js'],  // <- Esto apunta correctamente
    //require: ['./tests/prod_actual/Base/step-definitions/**/*.js'],  // Ahora busca dentro de todos los subdirectorios
    //require: [__dirname + '/tests/prod_actual/Base/step-definitions/**/*.js'],
    timeout: 160000, // Establece un límite de tiempo global de 60 segundos
    format: ['@cucumber/pretty-formatter']
  }
};
//npx cucumber-js --require ./step-definitions/login_2.js


