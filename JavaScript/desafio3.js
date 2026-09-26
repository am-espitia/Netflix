/*
 * DESAFÍO 3: PRINCIPALES PAÍSES PRODUCTORES
 *
 * Se identifican los países con mayor cantidad de títulos
 * disponibles en Netflix y se construye un ranking
 * interactivo con las opciones Top 3, Top 5 y Top 10.
 */

let tablaRankingPaises = null;

function prepararDesafio3(registros) {

    // Crear la tabla para contabilizar los países
    const tabla = new google.visualization.DataTable();

    tabla.addColumn("string", "País");
    tabla.addColumn("number", "Cantidad");

    let titulosConPais = 0;

    registros.forEach(registro => {

        // Seleccionar los títulos con información geográfica
        if (
            typeof registro.country !== "string" ||
            !registro.country.trim()
        ) return;

        titulosConPais++;

        /*
         * Separar los países asociados a cada título.
         * Las coproducciones se contabilizan una vez
         * por cada país participante.
         *
         * Set evita contar dos veces un mismo país
         * si aparece repetido dentro del registro.
         */
        const paises = new Set(
            registro.country
                .split(",")
                .map(pais => pais.trim())
                .filter(Boolean)
        );

        paises.forEach(pais => {
            tabla.addRow([pais, 1]);
        });
    });

    /*
     * Agrupar las asociaciones entre títulos y países
     * mediante data.group() para calcular la cantidad
     * de producciones correspondientes a cada país.
     */
    const agrupados = google.visualization.data.group(
        tabla,
        [0],
        [
            {
                column: 1,
                aggregation: google.visualization.data.sum,
                type: "number",
                label: "Títulos"
            }
        ]
    );

    // Ordenar los países por cantidad de títulos
    agrupados.sort([
        { column: 1, desc: true },
        { column: 0 }
    ]);

    /*
     * Definir un degradado de colores para reforzar
     * visualmente las posiciones del ranking.
     */
    const colores = [
        "#FF535D",
        "#FF6871",
        "#FF7C84",
        "#FF9097",
        "#FFA3A9",
        "#FFB0B5",
        "#FFBDC1",
        "#FFC9CC",
        "#FFD4D6",
        "#FFE0E1"
    ];

    // Preparar la tabla que utilizará el gráfico de barras
    tablaRankingPaises =
        new google.visualization.DataTable();

    tablaRankingPaises.addColumn("string", "País");
    tablaRankingPaises.addColumn("number", "Títulos");
    tablaRankingPaises.addColumn({
        type: "string",
        role: "style"
    });
    tablaRankingPaises.addColumn({
        type: "string",
        role: "tooltip"
    });

    const formato = new Intl.NumberFormat("es-CO");

    for (
        let i = 0;
        i < Math.min(10, agrupados.getNumberOfRows());
        i++
    ) {

        const pais = agrupados.getValue(i, 0);
        const titulos = agrupados.getValue(i, 1);

        /*
         * Calcular la participación respecto a los títulos
         * con información geográfica disponible.
         *
         * Los porcentajes pueden sumar más del 100 %,
         * debido a la participación de varios países
         * en una misma producción.
         */
        const porcentaje =
            (titulos / titulosConPais * 100).toFixed(1);

        // Incorporar el color y el tooltip de cada país
        tablaRankingPaises.addRow([
            pais,
            titulos,
            colores[i],
            `${pais}\nTítulos: ${formato.format(titulos)}\nParticipación: ${porcentaje}%`
        ]);
    }

    // Aplicar separadores de miles a las cantidades
    const formatoNumerico =
        new google.visualization.NumberFormat({
            pattern: "#,###"
        });

    formatoNumerico.format(tablaRankingPaises, 1);
}

function dibujarDesafio3() {

    if (!tablaRankingPaises) return;

    // Obtener la cantidad de países seleccionada en el filtro
    const cantidad = Number(
        document.getElementById("filtro-paises").value
    );

    /*
     * Utilizar DataView para mostrar únicamente
     * los países correspondientes al Top seleccionado,
     * sin modificar la tabla del ranking.
     */
    const vista = new google.visualization.DataView(
        tablaRankingPaises
    );

    vista.setRows(
        Array.from(
            {
                length: Math.min(
                    cantidad,
                    tablaRankingPaises.getNumberOfRows()
                )
            },
            (_, i) => i
        )
    );

    const contenedor =
        document.getElementById("grafico-paises");

    /*
     * Configurar el gráfico de barras horizontales,
     * manteniendo el orden descendente, el degradado
     * y la adaptación a distintos tamaños de pantalla.
     */
    const opciones = {
        width: contenedor.clientWidth,
        height: Math.max(360, cantidad * 48 + 110),

        backgroundColor: "#353538",

        chartArea: {
            left: contenedor.clientWidth < 600 ? 125 : 190,
            right: 35,
            top: 20,
            bottom: 65,
            backgroundColor: "#353538"
        },

        reverseCategories: false,

        legend: {
            position: "none"
        },

        bar: {
            groupWidth: "70%"
        },

        hAxis: {
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

        vAxis: {
            textStyle: {
                color: "#F1F1F1",
                fontSize: contenedor.clientWidth < 600
                    ? 10
                    : 12
            }
        },

        tooltip: {
            trigger: "focus",
            textStyle: {
                fontSize: 13,
                color: "#222222"
            }
        }
    };

    // Dibujar el ranking según la selección del usuario
    const grafico = new google.visualization.BarChart(
        contenedor
    );

    grafico.draw(vista, opciones);
}
