/*
 * Inicialización de Google Charts y carga del dataset.
 * Los registros se comparten entre las visualizaciones
 * para trabajar con la misma información.
 */

google.charts.load("current", {
    packages: ["corechart"],
    language: "es"
});

google.charts.setOnLoadCallback(iniciarDashboard);

let datosNetflix = [];

async function iniciarDashboard() {
    try {
        // Cargar los datos procesados en Google Colab
        const respuesta = await fetch(
            "data/netflix_limpio.json"
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo JSON.");
        }

        datosNetflix = await respuesta.json();

        // Construir las visualizaciones de los desafíos 2 y 3
        dibujarDesafio2(datosNetflix);

        prepararDesafio3(datosNetflix);
        dibujarDesafio3();

        // Actualizar el ranking según la opción seleccionada
        document.getElementById("filtro-paises")
            .addEventListener("change", dibujarDesafio3);

    } catch (error) {
        console.error(error);

        document.getElementById("grafico-evolucion")
            .textContent = "Error al cargar los datos.";

        document.getElementById("grafico-paises")
            .textContent = "Error al cargar los datos.";
    }
}

/*
 * Redibujar las visualizaciones cuando cambia el tamaño
 * de la ventana para mantener su adaptación responsive.
 */
let temporizador;

window.addEventListener("resize", () => {
    clearTimeout(temporizador);

    temporizador = setTimeout(() => {
        if (datosNetflix.length > 0) {
            dibujarDesafio2(datosNetflix);
            dibujarDesafio3();
        }
    }, 200);
});
