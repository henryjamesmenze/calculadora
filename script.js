document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos
  const calculateBtn = document.getElementById("calculate-btn");

  // --- Funciones de Utilidad ---

  // Resuelve las raíces de la ecuación característica (Orden 2)
  // Ecuación: r^2 - c1*r - c2 = 0
  function solveQuadratic(c1, c2) {
    const a = 1;
    const b = -c1;
    const c = -c2;
    const delta = b * b - 4 * a * c;

    if (delta > 0) {
      // Raíces reales y distintas
      const r1 = (-b + Math.sqrt(delta)) / (2 * a);
      const r2 = (-b - Math.sqrt(delta)) / (2 * a);
      return { type: "distinct", r1, r2 };
    } else if (delta === 0) {
      // Raíz real doble
      const r = -b / (2 * a);
      return { type: "double", r };
    } else {
      // Raíces complejas (conjugadas)
      const alpha = -b / (2 * a);
      const beta = Math.sqrt(-delta) / (2 * a);
      return { type: "complex", alpha, beta };
    }
  }

  // Resuelve el sistema 2x2 para constantes C1 y C2 (raíces distintas)
  function solveSystemDistinct(r1, r2, a0, a1) {
    // C1 + C2 = a0
    // C1*r1 + C2*r2 = a1
    const determinant = r2 - r1;

    if (Math.abs(determinant) < 1e-9) return null;

    const C2 = (a1 - a0 * r1) / determinant;
    const C1 = a0 - C2;

    return { C1, C2 };
  }

  // Resuelve el sistema para raíz doble
  function solveSystemDouble(r, a0, a1) {
    // C1 = a0
    // C1*r + C2*r = a1
    const C1 = a0;
    const C2 = (a1 - C1 * r) / r;

    return { C1, C2 };
  }

  // Resuelve el sistema para raíces complejas
  function solveSystemComplex(rho, theta, a0, a1) {
    // n=0: C1 = a0
    const C1 = a0;

    // n=1: a1 = rho * (C1*cos(theta) + C2*sin(theta))
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    if (Math.abs(sinTheta) < 1e-9) return null; // Error en casos triviales

    const C2 = (a1 / rho - C1 * cosTheta) / sinTheta;

    return { C1, C2 };
  }

  // --- Lógica Principal de Cálculo ---

  calculateBtn.addEventListener("click", () => {
    const c1 = parseFloat(document.getElementById("c1").value);
    const c2 = parseFloat(document.getElementById("c2").value || "0");
    const a0 = parseFloat(document.getElementById("a0").value);
    let a1 = parseFloat(document.getElementById("a1").value || "0");

    const errorDisplay = document.getElementById("error-display");
    errorDisplay.textContent = "";

    // Validaciones básicas
    if (isNaN(c1) || isNaN(a0)) {
      errorDisplay.textContent =
        "Los coeficientes y a0 deben ser números válidos.";
      return;
    }

    const isOrderTwo = c2 !== 0;

    if (isOrderTwo && isNaN(a1)) {
      errorDisplay.textContent =
        "Para una recurrencia de orden 2 (c2 ≠ 0), el valor de a1 es obligatorio.";
      return;
    }

    // --- Configuración de la Interfaz ---
    document
      .getElementById("a1-input-group")
      .classList.toggle("hidden", !isOrderTwo);
    document
      .getElementById("c2-input-group")
      .classList.toggle("hidden", !isOrderTwo);

    // --- 1. Display de la Ecuación ---
    let eq = `a(n) = ${c1}a(n-1)`;
    let charEq = `r - ${c1} = 0`;
    let roots, C1, C2;

    if (isOrderTwo) {
      eq += (c2 > 0 ? " + " : " - ") + Math.abs(c2) + "a(n-2)";
      charEq = `r² - ${c1}r - ${c2} = 0`;
    }
    document.getElementById("equation-display").textContent = eq;
    document.getElementById("char-eq-display").textContent = charEq;

    // --- 2. Solución General y Constantes ---

    let solGeneral = "";
    let solFinal = "";

    if (!isOrderTwo) {
      // Caso Orden 1: a_n = c1 * a_{n-1}
      const r1 = c1;
      C1 = a0;

      document.getElementById("roots-display").textContent = `r = ${r1.toFixed(
        2
      )}`;
      solGeneral = `C ( ${r1.toFixed(2)} )^n`;
      solFinal = `${C1.toFixed(2)} ( ${r1.toFixed(2)} )^n`;
    } else {
      // Caso Orden 2: a_n = c1 * a_{n-1} + c2 * a_{n-2}
      roots = solveQuadratic(c1, c2);

      if (roots.type === "distinct") {
        const r1 = roots.r1;
        const r2 = roots.r2;

        const solution = solveSystemDistinct(r1, r2, a0, a1);
        if (!solution) {
          errorDisplay.textContent =
            "Error en el sistema de constantes (denominador cero).";
          return;
        }
        ({ C1, C2 } = solution);

        console.log("C1:", C1, "C2:", C2);
        console.log("r1:", r1, "r2:", r2);

        document.getElementById(
          "roots-display"
        ).textContent = `r1 ≈ ${r1.toFixed(2)}, r2 ≈ ${r2.toFixed(2)}`;

        solGeneral = `C1(${r1.toFixed(2)})**n + C2(${r2.toFixed(2)})**n`;

        solFinal = `${C1.toFixed(2)}(${r1.toFixed(2)})**n + ${C2.toFixed(
          2
        )}(${r2.toFixed(2)})**n`;
      } else if (roots.type === "double") {
        const r = roots.r;
        ({ C1, C2 } = solveSystemDouble(r, a0, a1));

        document.getElementById("roots-display").textContent = `r = ${r.toFixed(
          2
        )} (doble)`;
        solGeneral = `C1(${r.toFixed(2)})^n + C2 n (${r.toFixed(2)})^n`;
        solFinal = `${C1.toFixed(2)}(${r.toFixed(2)})^n + ${C2.toFixed(
          2
        )}n(${r.toFixed(2)})^n`;
      } else if (roots.type === "complex") {
        const { alpha, beta } = roots;
        const rho = Math.sqrt(alpha * alpha + beta * beta);
        const theta = Math.atan2(beta, alpha); // Radianes
        const thetaDeg = ((theta * 180) / Math.PI).toFixed(2);

        const solution = solveSystemComplex(rho, theta, a0, a1);
        if (!solution) {
          errorDisplay.textContent =
            "Error al resolver constantes en caso complejo (división por seno(theta)).";
          return;
        }
        ({ C1, C2 } = solution);

        document.getElementById(
          "roots-display"
        ).textContent = `r = ${alpha.toFixed(2)} ± ${beta.toFixed(
          2
        )}i (ρ ≈ ${rho.toFixed(2)}, θ ≈ ${thetaDeg}° )`;
        solGeneral = `ρ^n ( C1 cos(nθ) + C2 sin(nθ) )`;
        solFinal = `${rho.toFixed(2)}^n ( ${C1.toFixed(
          2
        )} cos(n*${thetaDeg}°) + ${C2.toFixed(2)} sin(n*${thetaDeg}°) )`;
      }
    }

    document.getElementById("sol-homogenea-display").textContent = solGeneral;
    document.getElementById("sol-final-display").textContent = solFinal;
  });

  // Ejecutar cálculo inicial para mostrar un ejemplo
  calculateBtn.click();
});
