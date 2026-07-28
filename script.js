/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEY = "NOTEPAD_ATENDIMENTOS_V5";

let database = {
    huggy: [],
    caixa: []
};

let draggedCard = null;
let draggedFromColumn = null;

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    registerSearch();

    registerCollapsibles();

    startTimerUpdater();

});

/* =========================================================
   STORAGE
========================================================= */

function saveData(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

    updateLastSave();

}

function loadData(){

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if(saved){

        database =
            JSON.parse(saved);

    }

    renderAll();

}

function updateLastSave(){

    const element =
        document.getElementById(
            "last-save"
        );

    if(!element) return;

    element.innerText =
        "Última alteração: " +
        new Date().toLocaleString(
            "pt-BR"
        );

}

/* =========================================================
   CARD MODEL
========================================================= */

function cpfCnpjMask(value){

    value = value.replace(/\D/g,'');

    if(value.length <= 11){

        value = value.replace(
            /(\d{3})(\d)/,
            '$1.$2'
        );

        value = value.replace(
            /(\d{3})(\d)/,
            '$1.$2'
        );

        value = value.replace(
            /(\d{3})(\d{1,2})$/,
            '$1-$2'
        );

    }else{

        value = value.replace(
            /^(\d{2})(\d)/,
            '$1.$2'
        );

        value = value.replace(
            /^(\d{2})\.(\d{3})(\d)/,
            '$1.$2.$3'
        );

        value = value.replace(
            /\.(\d{3})(\d)/,
            '.$1/$2'
        );

        value = value.replace(
            /(\d{4})(\d)/,
            '$1-$2'
        );

    }

    return value;

}

function phoneMask(value){

    value = value.replace(/\D/g,'');

    if(value.length <= 10){

        value = value.replace(
            /^(\d{2})(\d)/,
            '($1) $2'
        );

        value = value.replace(
            /(\d{4})(\d)/,
            '$1-$2'
        );

    }else{

        value = value.replace(
            /^(\d{2})(\d)/,
            '($1) $2'
        );

        value = value.replace(
            /(\d{5})(\d)/,
            '$1-$2'
        );

    }

    return value;

}

function createEmptyCard(){

    return {

        id:
            crypto.randomUUID(),

        Nome: "",
        CPF: "",
        Protocolo: "",
        Telefone: "",

        Informações: "",
        Finalizacao: "",

        created_at:
            new Date()
            .toLocaleString("pt-BR"),

        opened_at:
            Date.now()

    };

}

/* =========================================================
   CREATE
========================================================= */

function createCard(column){

    database[column].push(
        createEmptyCard()
    );

    saveData();

    renderAll();

}

/* =========================================================
   DELETE
========================================================= */

function removeCard(
    column,
    id
){

    database[column] =
        database[column].filter(
            card =>
            card.id !== id
        );

    saveData();

    renderAll();

}

/* =========================================================
   UPDATE FIELD
========================================================= */

function updateField(
    column,
    id,
    field,
    value
){

    const card =
        database[column].find(
            c => c.id === id
        );

    if(!card) return;

    card[field] = value;

    saveData();

}

/* =========================================================
   TIMER
========================================================= */

function formatDuration(ms){

    const totalSeconds =
        Math.floor(ms / 1000);

    const hours =
        String(
            Math.floor(
                totalSeconds / 3600
            )
        ).padStart(2,"0");

    const minutes =
        String(
            Math.floor(
                (totalSeconds % 3600) / 60
            )
        ).padStart(2,"0");

    const seconds =
        String(
            totalSeconds % 60
        ).padStart(2,"0");

    return `${hours}:${minutes}:${seconds}`;

}

function startTimerUpdater(){

    setInterval(() => {

        document
            .querySelectorAll(
                ".timer[data-opened-at]"
            )
            .forEach(timer => {

                const openedAt =
                    Number(
                        timer.dataset.openedAt
                    );

                if(!openedAt) return;

                timer.innerText =
                    formatDuration(
                        Date.now() - openedAt
                    );

            });

    },1000);

}

/* =========================================================
   RENDER
========================================================= */

function renderAll(){

    renderColumn(
        "huggy",
        "huggy-grid",
        "huggy-add-btn"
    );

    renderColumn(
        "caixa",
        "caixa-grid",
        "caixa-add-btn"
    );

    updateCounters();

}

function renderColumn(
    column,
    gridId,
    addButtonId
){

    const grid =
        document.getElementById(
            gridId
        );

    const addButton =
        document.getElementById(
            addButtonId
        );

    if(!grid) return;

    grid.innerHTML = "";

    database[column].forEach(card => {

        const cardElement =
            buildCard(
                card,
                column
            );

        grid.appendChild(
            cardElement
        );

    });

    if(addButton){

        grid.appendChild(
            addButton
        );

    }

}

/* =========================================================
   BUILD CARD
========================================================= */

function buildCard(
    card,
    column
){

    const div =
        document.createElement("div");

    div.className = "card";

    div.draggable = true;

    div.dataset.id = card.id;

    div.innerHTML = `

        <div class="card-top">

            <div class="card-actions">

                <span class="drag-icon">
                    ☰
                </span>

                <span
                    class="timer"
                    data-opened-at="${card.opened_at}"
                >
                    ${formatDuration(
                        Date.now() -
                        card.opened_at
                    )}
                </span>

            </div>

            <button
                class="delete-btn"
                type="button"
            >
                ✕
            </button>

        </div>

        <div class="field">

            <label>
                Nome do Cliente
            </label>

            <input
                type="text"
                data-field="nome"
                value="${escapeHtml(card.nome)}"
            >

        </div>

        <div class="field">

            <label>
                CPF/CNPJ
            </label>

            <input
                type="text"
                maxlength="14"
                data-field="cpf"
                value="${escapeHtml(card.cpf)}"
            >

        </div>

        <div class="field">

            <label>
                Protocolo
            </label>

            <input
                type="text"
                data-field="protocolo"
                value="${escapeHtml(card.protocolo)}"
            >

        </div>

        <div class="field">

            <label>
                Telefone
            </label>

            <input
                type="text"
                maxlength="15"
                data-field="telefone"
                value="${escapeHtml(card.telefone)}"
            >

        </div>

        <div class="field">

            <label>
                Informações
            </label>

            <textarea
                data-field="problema"
            >${escapeHtml(card.problema)}</textarea>

        </div>

        <div class="field">

            <label>
                Finalização
            </label>

            <textarea
                data-field="finalizacao"
            >${escapeHtml(card.finalizacao)}</textarea>

        </div>

        <div class="card-footer">

            <small class="created-at">
                ${card.created_at}
            </small>

        </div>

    `;

    div
        .querySelector(
            ".delete-btn"
        )
        .addEventListener(
            "click",
            () => {

                removeCard(
                    column,
                    card.id
                );

            }
        );

    div
        .querySelectorAll(
            "input, textarea"
        )
        .forEach(field => {

            field.addEventListener(
            "input",
            e => {

                let value =
                    e.target.value;

                const fieldName =
                    e.target.dataset.field;

                if(fieldName === "cpf"){

                    value =
                        cpfCnpjMask(value);

                    e.target.value =
                        value;

                }

                if(fieldName === "telefone"){

                    value =
                        phoneMask(value);

                    e.target.value =
                        value;

                }

                updateField(
                    column,
                    card.id,
                    fieldName,
                    value
                );

            }
        );

        });

    enableDrag(
        div,
        card.id,
        column
    );

    return div;

}

/* =========================================================
   DRAG & DROP
========================================================= */

function enableDrag(
    element,
    cardId,
    column
){

    element.addEventListener(
        "dragstart",
        () => {

            draggedCard =
                cardId;

            draggedFromColumn =
                column;

            element.classList.add(
                "dragging"
            );

        }
    );

    element.addEventListener(
        "dragend",
        () => {

            element.classList.remove(
                "dragging"
            );

        }
    );

}

function enableDrop(
    container,
    destinationColumn
){

    if(!container) return;

    container.addEventListener(
        "dragover",
        e => {

            e.preventDefault();

        }
    );

    container.addEventListener(
        "drop",
        e => {

            e.preventDefault();

            if(
                !draggedCard ||
                !draggedFromColumn
            ){
                return;
            }

            if(
                draggedFromColumn ===
                destinationColumn
            ){
                return;
            }

            const card =
                database[
                    draggedFromColumn
                ].find(
                    c =>
                    c.id === draggedCard
                );

            if(!card) return;

            database[
                draggedFromColumn
            ] =
                database[
                    draggedFromColumn
                ].filter(
                    c =>
                    c.id !== draggedCard
                );

            database[
                destinationColumn
            ].push(card);

            saveData();

            renderAll();

        }
    );

}

/* =========================================================
   ENABLE DROP AREAS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        enableDrop(
            document.getElementById(
                "huggy-grid"
            ),
            "huggy"
        );

        enableDrop(
            document.getElementById(
                "caixa-grid"
            ),
            "caixa"
        );

    }
);

/* =========================================================
   COUNTERS
========================================================= */

function updateCounters(){

    const huggyCount =
        document.getElementById(
            "huggy-count"
        );

    const caixaCount =
        document.getElementById(
            "caixa-count"
        );

    if(huggyCount){

        huggyCount.innerText =
            `${database.huggy.length} atendimentos`;

    }

    if(caixaCount){

        caixaCount.innerText =
            `${database.caixa.length} atendimentos`;

    }

}

/* =========================================================
   COLLAPSIBLE
========================================================= */

function registerCollapsibles(){

    document
        .querySelectorAll(
            ".collapsible"
        )
        .forEach(header => {

            header.addEventListener(
                "click",
                () => {

                    const column =
                        header.closest(
                            ".column"
                        );

                    column.classList.toggle(
                        "collapsed"
                    );

                }
            );

        });

}

/* =========================================================
   SEARCH
========================================================= */

function registerSearch(){

    const input =
        document.getElementById(
            "searchInput"
        );

    if(!input) return;

    input.addEventListener(
        "input",
        () => {

            const search =
                input.value
                .trim()
                .toLowerCase();

            const huggyColumn =
                document.getElementById(
                    "huggy-column"
                );

            const caixaColumn =
                document.getElementById(
                    "caixa-column"
                );

            let huggyHasResults =
                false;

            let caixaHasResults =
                false;

            document
                .querySelectorAll(
                    "#huggy-grid .card"
                )
                .forEach(card => {

                    const values = [];

                    card
                        .querySelectorAll(
                            "input, textarea"
                        )
                        .forEach(field => {

                            values.push(
                                field.value
                                    .toLowerCase()
                            );

                        });

                    const text =
                        values.join(" ");

                    const match =
                        text.includes(
                            search
                        );

                    card.classList.toggle(
                        "hidden-search",
                        !match
                    );

                    if(match){

                        huggyHasResults =
                            true;

                        huggyColumn.classList.remove(
                            "collapsed"
                        );

                    }

                });

            document
                .querySelectorAll(
                    "#caixa-grid .card"
                )
                .forEach(card => {

                    const values = [];

                    card
                        .querySelectorAll(
                            "input, textarea"
                        )
                        .forEach(field => {

                            values.push(
                                field.value
                                    .toLowerCase()
                            );

                        });

                    const text =
                        values.join(" ");

                    const match =
                        text.includes(
                            search
                        );

                    card.classList.toggle(
                        "hidden-search",
                        !match
                    );

                    if(match){

                        caixaHasResults =
                            true;

                        caixaColumn.classList.remove(
                            "collapsed"
                        );

                    }

                });

            if(search === ""){

                huggyColumn.classList.remove(
                    "hidden-column"
                );

                caixaColumn.classList.remove(
                    "hidden-column"
                );

                document
                    .querySelectorAll(
                        ".card"
                    )
                    .forEach(card => {

                        card.classList.remove(
                            "hidden-search"
                        );

                    });

                return;

            }

            huggyColumn.classList.toggle(
                "hidden-column",
                !huggyHasResults
            );

            caixaColumn.classList.toggle(
                "hidden-column",
                !caixaHasResults
            );

        });

}

/* =========================================================
   SECURITY
========================================================= */

function escapeHtml(text){

    if(
        text === null ||
        text === undefined
    ){
        return "";
    }

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

/* =========================================================
   INITIAL TIMER REFRESH
========================================================= */

setTimeout(() => {

    document
        .querySelectorAll(
            ".timer[data-opened-at]"
        )
        .forEach(timer => {

            const openedAt =
                Number(
                    timer.dataset.openedAt
                );

            if(!openedAt) return;

            timer.innerText =
                formatDuration(
                    Date.now() -
                    openedAt
                );

        });

},100);

/* =========================================================
   READY
========================================================= */

console.log(
    "Notepad carregado com sucesso."
);

function mascaraCPF(input) {
  // Remove tudo que não for dígito
  let valor = input.value.replace(/\D/g, "");
  
  // Aplica a máscara do CPF (000.000.000-00)
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  
  // Atualiza o valor do input
  input.value = valor;
}

function cpfCnpjMask(value){

    value = value.replace(/\D/g,'');

    if(value.length <= 11){

        value = value.replace(
            /(\d{3})(\d)/,
            '$1.$2'
        );

        value = value.replace(
            /(\d{3})(\d)/,
            '$1.$2'
        );

        value = value.replace(
            /(\d{3})(\d{1,2})$/,
            '$1-$2'
        );

    }else{

        value = value.replace(
            /^(\d{2})(\d)/,
            '$1.$2'
        );

        value = value.replace(
            /^(\d{2})\.(\d{3})(\d)/,
            '$1.$2.$3'
        );

        value = value.replace(
            /\.(\d{3})(\d)/,
            '.$1/$2'
        );

        value = value.replace(
            /(\d{4})(\d)/,
            '$1-$2'
        );

    }

    return value;

}