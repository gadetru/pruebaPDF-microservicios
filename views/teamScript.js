// Archivo: views/teamScript.js

const calcularPorcentajeHombres = (data) => {
    if (data) {
      let totalHombres = data.company_info.team.male;
      let totalPersonas = data.company_info.team.male + data.company_info.team.female;
  
      // Calcular el porcentaje de hombres
      let porcentajeHombres = (totalHombres / totalPersonas) * 100;
  
      // Limitar el porcentaje a un máximo del 100%
      porcentajeHombres = Math.min(100, porcentajeHombres);
  
      // Mapear el porcentaje a un rango de 0 a 10 sin decimales
      let porcentajeMapeadoHombres = Math.round(porcentajeHombres / 10);
  
      return porcentajeMapeadoHombres;
    }
  }
  
    const calcularPorcentajemujeres = (data) => {
        if (data){

            let totalMujeres = data.company_info.team.female;
            let totalPersonas = data.company_info.team.male + data.company_info.team.female;
          
       // Calcular el porcentaje de hombres
       let porcentajeMujeres = (totalMujeres / totalPersonas) * 100;
  
       // Limitar el porcentaje a un máximo del 100%
       porcentajeMujeres = Math.min(100, porcentajeMujeres);
   
       // Mapear el porcentaje a un rango de 0 a 10 sin decimales
       let porcentajeMapeadoMujeres = Math.round(porcentajeMujeres / 10);
   
       return porcentajeMapeadoMujeres;
        }
        
  }
  
  
  module.exports = {
    calcularPorcentajeHombres,
    calcularPorcentajemujeres

  }