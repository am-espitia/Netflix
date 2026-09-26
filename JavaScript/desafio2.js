/*
 * DESAFÍO 2: EVOLUCIÓN ANUAL DEL CATÁLOGO
 *
 * Se representa la cantidad de películas y series
 * incorporadas a Netflix por año mediante un gráfico
 * de líneas con información complementaria en los tooltips.
 */

function dibujarDesafio2(registros) {

    // Crear la tabla con las variables del análisis
    const tabla = new google.visualization.DataTable();

    tabla.addColumn("number", "Año");
    tabla.addColumn("number", "Películas");
    tabla.addColumn("number", "Series");

    registros.forEach(registro => {

        /*
         * Seleccionar los títulos con año de incorporación
         * disponible. Los registros sin fecha se excluyen
         * únicamente de este análisis.
         */
        if (registro.year_added == null) return;

        const anio = Number(registro.year_added);

        if (!Number.isInteger(anio)) return;

        // Identificar el tipo de contenido de cada registro
        tabla.addRow([
            anio,
            registro.type === "Movie" ? 1 : 0,
            registro.type === "TV Show" ? 1 : 0
        ]);
    });

    /*
     * Agrupar los registros por año con data.group()
     * y calcular las incorporaciones de cada tipo
     * mediante la función de agregación sum.
     */
    const agrupados = google.visualization.data.group(
        tabla,
        [0],
        [
            {
                column: 1,
                aggregation: google.visualization.data.sum,
                type: "number",
                label: "Películas"
            },
            {
                column: 2,
                aggregation: google.visualization.data.sum,
                type: "number",
                label: "Series"
            }
        ]
    );

    // Crear las columnas del gráfico y sus tooltips
    const datosGrafico = new google.visualization.DataTable();

    datosGrafico.addColumn("string", "Año");
    datosGrafico.addColumn("number", "Películas");
    datosGrafico.addColumn({
        type: "string",
        role: "tooltip"
    });
    datosGrafico.addColumn("number", "Series");
    datosGrafico.addColumn({
        type: "string",
        role: "tooltip"
    });

    const formato = new Intl.NumberFormat("es-CO");

    for (let i = 0; i < agrupados.getNumberOfRows(); i++) {

        const anio = agrupados.getValue(i, 0);
        const peliculas = agrupados.getValue(i, 1);
        const series = agrupados.getValue(i, 2);

        /*
         * Calcular la participación de cada tipo de
         * contenido respecto al total incorporado en
         * el mismo año.
         */
        const total = peliculas + series;

        const porcentajePeliculas =
            (peliculas / total * 100).toFixed(1);

        const porcentajeSeries =
            (series / total * 100).toFixed(1);

        // Incorporar cantidades y porcentajes a los tooltips
        datosGrafico.addRow([
            String(anio),
            peliculas,
            `Año: ${anio}\nPelículas: ${formato.format(peliculas)}\nParticipación: ${porcentajePeliculas}%`,
            series,
            `Año: ${anio}\nSeries: ${formato.format(series)}\nParticipación: ${porcentajeSeries}%`
        ]);
    }

    /*
     * Configurar el gráfico con una escala que comienza
     * en cero y diferenciar ambas series mediante colores,
     * tipos de línea y marcadores.
     */
    const contenedor =
        document.getElementById("grafico-evolucion");

    const opciones = {
        width: contenedor.clientWidth,
        height: 440,

        backgroundColor: "#353538",

        chartArea: {
            left: 75,
            right: 25,
            top: 55,
            bottom: 85,
            backgroundColor: "#353538"
        },

        colors: ["#FF535D", "#BBC2CC"],

        lineWidth: 3,

        series: {
            0: {
                pointShape: "circle",
                pointSize: 6
            },
            1: {
                lineDashStyle: [6, 4],
                pointShape: "diamond",
                pointSize: 7
            }
        },

        legend: {
            position: "top",
            textStyle: {
                color: "#F1F1F1",
                fontSize: 13
            }
        },

        hAxis: {
            title: "Año de incorporación",
            textStyle: {
                color: "#F1F1F1"
            },
            titleTextStyle: {
                color: "#F1F1F1"
            },
            slantedText: true,
            slantedTextAngle: 45
        },

        vAxis: {
            title: "Cantidad de títulos",
            viewWindow: {
                min: 0
            },
            format: "decimal",
            textStyle: {
                color: "#F1F1F1"
            },
            titleTextStyle: {
                color: "#F1F1F1"
            },
            gridlines: {
                color: "#66666B"
            },
            baselineColor: "#888888"
        },

        tooltip: {
            trigger: "focus",
            textStyle: {
                fontSize: 13,
                color: "#222222"
            }
        }
    };

    // Dibujar el gráfico de líneas
    const grafico = new google.visualization.LineChart(
        contenedor
    );

    grafico.draw(datosGrafico, opciones);
}
