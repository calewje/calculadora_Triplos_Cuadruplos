import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../dist/public/css/main.css';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('operacionInput');
  const btn = document.getElementById('btnDesglosar');
  const btn_Borrar = document.getElementById('btn_Borrar');
  const resultado = document.getElementById('resultado');
  const resul = document.getElementById('resul');
  const seleccion = document.getElementById('seleccion');
  const historial = document.getElementById('historial');

  let operacionesPrevias = [];

  btn.addEventListener('click', () => {
    const expr = input.value.trim();

    if (expr === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Ups',
        text: 'Debes ingresar una operación matemática primero.',
      });
      return;
    }

    try {
      let temp = 1;

      const procesar = (expresion) => {
        let pasosLocales = "";

        while (expresion.includes("(")) {
          const match = /\([^()]+\)/.exec(expresion);
          if (!match) break;

          const dentro = match[0].slice(1, -1);
          const resultadoDentro = procesar(dentro);

          expresion = expresion.replace(match[0], resultadoDentro.reemplazo);
          pasosLocales += resultadoDentro.pasos;
        }

        while (/[0-9.]+\/[0-9.]+/.test(expresion)) {
          const match = /([0-9.]+)\/([0-9.]+)/.exec(expresion);
          const izquierda = match[1];
          const derecha = match[2];
          const t = `t${temp++}`;
          pasosLocales += `${t} = ${izquierda} / ${derecha}\n`;
          expresion = expresion.replace(match[0], t);
        }

        while (/\*/.test(expresion)) {
          const match = /([0-9.]+|\bt\d+\b)\*([0-9.]+|\bt\d+\b)/.exec(expresion);
          if (!match) break;
          const izquierda = match[1];
          const derecha = match[2];
          const t = `t${temp++}`;
          pasosLocales += `${t} = ${izquierda} * ${derecha}\n`;
          expresion = expresion.replace(match[0], t);
        }

        while (/[\+\-]/.test(expresion)) {
          const match = /([0-9.]+|\bt\d+\b)([\+\-])([0-9.]+|\bt\d+\b)/.exec(expresion);
          if (!match) break;
          const izquierda = match[1];
          const operador = match[2];
          const derecha = match[3];
          const t = `t${temp++}`;
          pasosLocales += `${t} = ${izquierda} ${operador} ${derecha}\n`;
          expresion = expresion.replace(match[0], t);
        }

        return { reemplazo: expresion, pasos: pasosLocales };
      };

      let res;
      let salidaTexto = ""; 
      let resultadoFinal = eval(expr);

      if (seleccion.value === "triplo") {
        res = procesar(expr);
        const lineas = res.pasos.trim().split("\n");
        let triplos = "OPERADOR\tARG1\tARG2\tRESULTADO\n";
        lineas.forEach(linea => {
          const match = /t\d+ = (.+) ([\+\-\*\/]) (.+)/.exec(linea);
          if (match) {
            triplos += `${match[2]}\t\t${match[1]}\t${match[3]}\t${linea.split('=')[0].trim()}\n`;
          }
        });
        salidaTexto = `Triplos:\n${triplos}`;
      }

      else if (seleccion.value === "cuadruplo") {
        res = procesar(expr);
        const lineas = res.pasos.trim().split("\n");
        let cuadruplos = "RESULTADO\tOPERADOR\tARG1\tARG2\n";
        lineas.forEach(linea => {
          const match = /t\d+ = (.+) ([\+\-\*\/]) (.+)/.exec(linea);
          if (match) {
            cuadruplos += `${linea.split('=')[0].trim()}\t\t${match[2]}\t\t${match[1]}\t${match[3]}\n`;
          }
        });
        salidaTexto = `Cuádruplos:\n${cuadruplos}`;
      }

      else if (seleccion.value === "ambos") {
        res = procesar(expr);
        const lineas = res.pasos.trim().split("\n");

        let triplos = "OPERADOR\tARG1\tARG2\tRESULTADO\n";
        let cuadruplos = "RESULTADO\tOPERADOR\tARG1\tARG2\n";

        lineas.forEach(linea => {
          const match = /t\d+ = (.+) ([\+\-\*\/]) (.+)/.exec(linea);
          if (match) {
            triplos += `${match[2]}\t\t${match[1]}\t${match[3]}\t${linea.split('=')[0].trim()}\n`;
            cuadruplos += `${linea.split('=')[0].trim()}\t\t${match[2]}\t\t${match[1]}\t${match[3]}\n`;
          }
        });

        salidaTexto = `Triplos:\n${triplos}\n\nCuádruplos:\n${cuadruplos}`;
      }

      else {
        Swal.fire({
          icon: 'info',
          title: 'Selecciona un modo',
          text: 'Elige si deseas ver los Triplos o Cuádruplos.',
        });
        return;
      }

      operacionesPrevias.push(expr);

      historial.classList.remove('d-none');
      historial.innerHTML = `<h5>Historial de operaciones</h5><ul>` +
        operacionesPrevias.map((op, i) => `<li><b>${i + 1}.</b> ${op}</li>`).join('') +
        `</ul>`;

      resultado.textContent = salidaTexto;
      resul.textContent = `Resultado final: ${resultadoFinal}`;
      resultado.classList.remove('d-none');
      resul.classList.remove('d-none');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Revisa la operación. Ejemplo: 2*(3+4/2)',
      });
      resultado.classList.add('d-none');
      resul.classList.add('d-none');
    }

    btn_Borrar.addEventListener('click', () => {
    resultado.classList.add('d-none');
    resul.classList.add('d-none');
    resultado.textContent = '';
    resul.textContent = '';
    input.value = '';

    Swal.fire({
        icon: 'success',
        title: 'Limpio',
        text: 'Se han borrado los resultados actuales.',
        timer: 1500,
        showConfirmButton: false,
      });
    });
  });
});
