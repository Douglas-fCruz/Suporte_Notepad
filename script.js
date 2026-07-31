/* =========================================================
   CONFIG
========================================================= */


const STORAGE_KEY = "NOTEPAD_ATENDIMENTOS_V7";



let database = {


    atendimento:{


        huggy: [],


        caixa: []


    },


    historico:{


        huggy: [],


        caixa: []


    }


};





let draggedCard = null;

let draggedFromColumn = null;









/* =========================================================
   INIT
========================================================= */


document.addEventListener(

"DOMContentLoaded",

()=>{


    loadData();


    registerSearch();


    registerCollapsibles();


    registerMenu();


    startTimerUpdater();




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



    if(!element)

        return;





    element.innerText =

        "Última alteração: " +

        new Date()

        .toLocaleString(
            "pt-BR"
        );



}









/* =========================================================
   MENU
========================================================= */


function registerMenu(){



    const button =

        document.getElementById(
            "menu-btn"
        );



    const sidebar =

        document.getElementById(
            "sidebar"
        );



    const overlay =

        document.getElementById(
            "overlay"
        );




    if(!button)

        return;





    button.onclick = ()=>{


        sidebar.classList.toggle(
            "active"
        );



        overlay.classList.toggle(
            "active"
        );



    };






    if(overlay){


        overlay.onclick = ()=>{


            sidebar.classList.remove(
                "active"
            );



            overlay.classList.remove(
                "active"
            );



        };


    }



}









/* =========================================================
   CARD MODEL
========================================================= */


function createEmptyCard(){



    return {


        id:

            crypto.randomUUID(),



        nome:"",



        cpf:"",



        protocolo:"",



        telefone:"",




        relato:"",




        agendar_os:false,




        os_info:"",




        prioridade:false,




        created_at:

            new Date()

            .toLocaleString(
                "pt-BR"
            ),




        opened_at:

            Date.now()



    };



}









/* =========================================================
   CREATE CARD
========================================================= */


function createCard(column){



    database.atendimento[column]

    .push(

        createEmptyCard()

    );



    saveData();



    renderAll();



}









/* =========================================================
   DELETE TO HISTORY
========================================================= */


function removeCard(

    column,

    id

){



    const card =

        database.atendimento[column]

        .find(

            item =>

            item.id === id

        );



    if(!card)

        return;





    database.historico[column]

    .push(

        card

    );





    database.atendimento[column]

    =

    database.atendimento[column]

    .filter(

        item =>

        item.id !== id

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

        database.atendimento[column]

        .find(

            item =>

            item.id === id

        );



    if(!card)

        return;



    card[field] = value;



    saveData();



}









/* =========================================================
   PRIORITY
========================================================= */


function togglePriority(

    column,

    id

){



    const card =

        database.atendimento[column]

        .find(

            item =>

            item.id === id

        );



    if(!card)

        return;



    card.prioridade =

        !card.prioridade;



    saveData();



    renderAll();



}









/* =========================================================
   AGENDAR O.S
========================================================= */


function toggleOS(

    column,

    id

){



    const card =

        database.atendimento[column]

        .find(

            item =>

            item.id === id

        );



    if(!card)

        return;




    card.agendar_os =

        !card.agendar_os;



    saveData();



    renderAll();



}

/* =========================================================
   TIMER
========================================================= */


function formatDuration(ms){


    const totalSeconds =

        Math.floor(
            ms / 1000
        );



    const hours =

        String(

            Math.floor(
                totalSeconds / 3600
            )

        )

        .padStart(
            2,
            "0"
        );



    const minutes =

        String(

            Math.floor(

                (totalSeconds % 3600) / 60

            )

        )

        .padStart(
            2,
            "0"
        );



    const seconds =

        String(

            totalSeconds % 60

        )

        .padStart(
            2,
            "0"
        );



    return `${hours}:${minutes}:${seconds}`;


}







function startTimerUpdater(){



    setInterval(

        ()=>{



            document

            .querySelectorAll(
                ".timer[data-opened-at]"
            )

            .forEach(

                timer=>{


                    const opened =

                        Number(
                            timer.dataset.openedAt
                        );



                    if(!opened)

                        return;



                    timer.innerText =

                        formatDuration(

                            Date.now() - opened

                        );



                }

            );



        },

        1000

    );



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

    buttonId

){



    const grid =

        document.getElementById(
            gridId
        );



    const button =

        document.getElementById(
            buttonId
        );




    if(!grid)

        return;





    grid.innerHTML = "";





    database.atendimento[column]

    .forEach(

        card=>{


            grid.appendChild(

                buildCard(

                    card,

                    column

                )

            );



        }

    );






    if(button){


        grid.appendChild(
            button
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

        document.createElement(
            "div"
        );




    div.className =

        "card";




    if(card.prioridade){


        div.classList.add(
            "priority"
        );


    }





    div.draggable = true;



    div.dataset.id =

        card.id;






    div.innerHTML = `



<div class="card-top">


<div class="card-actions">



<span class="drag-icon">
☰
</span>




<button

class="priority-btn ${card.prioridade ? "active":""}"

title="priorizar atendimento"

>

${card.prioridade ? "★":"☆"}

</button>




<span

class="timer"

data-opened-at="${card.opened_at}"

>

${formatDuration(

Date.now() - card.opened_at

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

data-field="nome"

value="${escapeHtml(card.nome)}"

>



</div>







<div class="field">


<label>

CPF/CNPJ

</label>



<input

data-field="cpf"

value="${escapeHtml(card.cpf)}"

>



</div>







<div class="field">


<label>

Protocolo

</label>



<input

data-field="protocolo"

value="${escapeHtml(card.protocolo)}"

>



</div>







<div class="field">


<label>

Telefone

</label>



<input

data-field="telefone"

value="${escapeHtml(card.telefone)}"

>



</div>







<div class="field">


<label>

Relato/Informações

</label>




<textarea

data-field="relato"

>${escapeHtml(card.relato)}</textarea>



</div>








<div class="field">


<label>

Agendar O.S?

</label>




<div class="os-selector">



<button

class="os-btn ${!card.agendar_os ? "active":""}"

data-value="false"

>

Não

</button>




<button

class="os-btn ${card.agendar_os ? "active":""}"

data-value="true"

>

Sim

</button>



</div>



</div>








<div

class="field os-info"

style="display:${card.agendar_os ? "flex":"none"}"

>


<label>

Informação da O.S

</label>



<textarea

data-field="os_info"

>${escapeHtml(card.os_info)}</textarea>



</div>








<div class="card-footer">


<small>

${card.created_at}

</small>



</div>




`;









/* DELETE */


div

.querySelector(
".delete-btn"
)

.onclick = ()=>{


    removeCard(

        column,

        card.id

    );


};









/* PRIORITY */


div

.querySelector(
".priority-btn"
)

.onclick = ()=>{


    togglePriority(

        column,

        card.id

    );


};









/* O.S BUTTON */


div

.querySelectorAll(
".os-btn"
)

.forEach(

button=>{


    button.onclick = ()=>{


        toggleOS(

            column,

            card.id

        );


    };


}

);








/* INPUTS */


div

.querySelectorAll(
"input, textarea"
)

.forEach(

field=>{


    field.oninput = event=>{


        updateField(

            column,

            card.id,

            event.target.dataset.field,

            event.target.value

        );


    };



}

);






enableDrag(

    div,

    card.id,

    column

);






return div;



}

/* =========================================================
   DRAG AND DROP
========================================================= */


function enableDrag(

    element,

    id,

    column

){



    element.addEventListener(

        "dragstart",

        ()=>{


            draggedCard = id;


            draggedFromColumn = column;



            element.classList.add(
                "dragging"
            );


        }

    );







    element.addEventListener(

        "dragend",

        ()=>{


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



    if(!container)

        return;





    container.addEventListener(

        "dragover",

        event=>{


            event.preventDefault();


        }

    );






    container.addEventListener(

        "drop",

        ()=>{



            if(

                !draggedCard ||

                !draggedFromColumn

            )

                return;






            if(

                draggedFromColumn ===

                destinationColumn

            )

                return;








            const card =

                database.atendimento[draggedFromColumn]

                .find(

                    item =>

                    item.id === draggedCard

                );






            if(!card)

                return;







            database.atendimento[draggedFromColumn]

            =

            database.atendimento[draggedFromColumn]

            .filter(

                item =>

                item.id !== draggedCard

            );







            database.atendimento[destinationColumn]

            .push(card);








            saveData();


            renderAll();





            draggedCard = null;


            draggedFromColumn = null;




        }

    );



}









/* =========================================================
   COUNTERS
========================================================= */


function updateCounters(){



    const huggy =

        document.getElementById(
            "huggy-count"
        );



    const caixa =

        document.getElementById(
            "caixa-count"
        );







    if(huggy){


        huggy.innerText =

        `${database.atendimento.huggy.length} atendimentos`;



    }






    if(caixa){


        caixa.innerText =

        `${database.atendimento.caixa.length} atendimentos`;



    }



}









/* =========================================================
   COLLAPSE
========================================================= */


function registerCollapsibles(){



    document

    .querySelectorAll(
        ".collapsible"
    )

    .forEach(

        header=>{



            header.onclick = ()=>{



                const column =

                    header.closest(
                        ".column"
                    );





                column.classList.toggle(
                    "collapsed"
                );




            };



        }

    );



}









/* =========================================================
   SEARCH
========================================================= */


function registerSearch(){


    const input =

        document.getElementById(
            "searchInput"
        );



    if(!input)

        return;





    input.addEventListener(

        "input",

        ()=>{



            const search =

                input.value

                .toLowerCase()

                .trim();





            const huggyColumn =

                document.getElementById(
                    "huggy-column"
                );




            const caixaColumn =

                document.getElementById(
                    "caixa-column"
                );





            let huggyFound = false;

            let caixaFound = false;








            document

            .querySelectorAll(
                "#huggy-grid .card"
            )

            .forEach(

                card=>{



                    let text = "";





                    card

                    .querySelectorAll(
                        "input, textarea"
                    )

                    .forEach(

                        field=>{


                            text +=

                            " " +

                            field.value

                            .toLowerCase();



                        }

                    );






                    const match =

                        text.includes(
                            search
                        );







                    card.classList.toggle(

                        "hidden-search",

                        !match

                    );






                    if(match){


                        huggyFound = true;


                    }



                }

            );










            document

            .querySelectorAll(
                "#caixa-grid .card"
            )

            .forEach(

                card=>{



                    let text = "";





                    card

                    .querySelectorAll(
                        "input, textarea"
                    )

                    .forEach(

                        field=>{


                            text +=

                            " " +

                            field.value

                            .toLowerCase();



                        }

                    );







                    const match =

                        text.includes(
                            search
                        );







                    card.classList.toggle(

                        "hidden-search",

                        !match

                    );







                    if(match){


                        caixaFound = true;


                    }




                }

            );









            /*
                PESQUISA VAZIA
            */

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

                .forEach(

                    card=>{


                        card.classList.remove(
                            "hidden-search"
                        );


                    }

                );



                return;


            }









            /*
                ESCONDE COLUNAS SEM RESULTADO
            */


            huggyColumn.classList.toggle(

                "hidden-column",

                !huggyFound

            );





            caixaColumn.classList.toggle(

                "hidden-column",

                !caixaFound

            );





        }

    );


}





/* =========================================================
   CPF / CNPJ MASK
========================================================= */


function cpfCnpjMask(value){



    value =

        value.replace(
            /\D/g,
            ""
        );





    if(value.length <= 11){



        value = value.replace(

            /(\d{3})(\d)/,

            "$1.$2"

        );




        value = value.replace(

            /(\d{3})(\d)/,

            "$1.$2"

        );





        value = value.replace(

            /(\d{3})(\d{1,2})$/,

            "$1-$2"

        );



    }





    return value;



}









function phoneMask(value){



    value =

        value.replace(
            /\D/g,
            ""
        );





    if(value.length <= 10){



        value = value.replace(

            /^(\d{2})(\d)/,

            "($1) $2"

        );




        value = value.replace(

            /(\d{4})(\d)/,

            "$1-$2"

        );



    }

    else{



        value = value.replace(

            /^(\d{2})(\d)/,

            "($1) $2"

        );




        value = value.replace(

            /(\d{5})(\d)/,

            "$1-$2"

        );



    }





    return value;



}









/* =========================================================
   SECURITY
========================================================= */


function escapeHtml(text){



    if(

        text === null ||

        text === undefined

    )

        return "";






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
   GLOBAL INPUT MASK
========================================================= */


document.addEventListener(

"input",

event=>{



    if(

        event.target.dataset.field === "cpf"

    ){


        event.target.value =

            cpfCnpjMask(

                event.target.value

            );



    }







    if(

        event.target.dataset.field === "telefone"

    ){


        event.target.value =

            phoneMask(

                event.target.value

            );



    }



}

);









console.log(

"Helpdesk CAIXA carregado corretamente"

);