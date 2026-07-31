/* =========================================================
   CONFIG
========================================================= */


const STORAGE_KEY = "NOTEPAD_ATENDIMENTOS_V7";



let database = {


    atendimento:{


        huggy:[],


        caixa:[]


    },


    historico:{


        huggy:[],


        caixa:[]


    }


};







/* =========================================================
   INIT
========================================================= */


document.addEventListener(

"DOMContentLoaded",

()=>{


    loadData();


    renderHistory();


    registerMenu();


    registerDeleteButtons();



}

);









/* =========================================================
   STORAGE
========================================================= */


function loadData(){


    const saved =

        localStorage.getItem(
            STORAGE_KEY
        );



    if(saved){


        database =

            JSON.parse(saved);



    }



}








function saveData(){


    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(database)

    );


}









/* =========================================================
   MENU HAMBURGER
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



        if(overlay){

            overlay.classList.toggle(
                "active"
            );

        }


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
   RENDER HISTORY
========================================================= */


function renderHistory(){



    renderColumnHistory(

        "huggy",

        "huggy-history-grid"

    );





    renderColumnHistory(

        "caixa",

        "caixa-history-grid"

    );





    updateCount();



}









function renderColumnHistory(

    column,

    gridId

){



    const grid =

        document.getElementById(
            gridId
        );



    if(!grid)

        return;





    grid.innerHTML="";







    database.historico[column]

    .forEach(

        card=>{



            grid.appendChild(

                createHistoryCard(
                    card
                )

            );



        }

    );



}









/* =========================================================
   BUILD HISTORY CARD
========================================================= */


function createHistoryCard(card){



    const div =

        document.createElement(
            "div"
        );



    div.className =

        "card history-card";





    div.innerHTML = `



<div class="card-top">


<div class="card-actions">


<span>
🗑
</span>



</div>


</div>






<div class="field">


<label>
Nome do Cliente
</label>


<input

readonly

value="${escapeHtml(card.nome)}"

>


</div>







<div class="field">


<label>
CPF/CNPJ
</label>


<input

readonly

value="${escapeHtml(card.cpf)}"

>


</div>







<div class="field">


<label>
Protocolo
</label>


<input

readonly

value="${escapeHtml(card.protocolo)}"

>


</div>







<div class="field">


<label>
Telefone
</label>


<input

readonly

value="${escapeHtml(card.caixa)}"

>


</div>







<div class="field">


<label>
Relato/Informações
</label>



<textarea readonly>

${escapeHtml(card.relato)}

</textarea>


</div>





<div class="field">


<label>
Agendar O.S?
</label>



<input

readonly

value="${
card.agendar_os

?

"Sim"

:

"Não"

}"

>


</div>







<div class="field">


<label>
Informação da O.S
</label>



<textarea readonly>

${escapeHtml(card.os_info)}

</textarea>


</div>







<div class="card-footer">


<small>

${card.created_at}

</small>


</div>



`;





    return div;



}

/* =========================================================
   DELETE HISTORY
========================================================= */


function registerDeleteButtons(){



    const huggyBtn =

        document.getElementById(
            "delete-huggy-history"
        );




    const caixaBtn =

        document.getElementById(
            "delete-caixa-history"
        );





    const globalBtn =

        document.getElementById(
            "delete-all-history"
        );







    if(huggyBtn){



        huggyBtn.onclick = ()=>{



            const confirmDelete =

                confirm(
                    "Apagar histórico Huggy?"
                );



            if(!confirmDelete)

                return;





            database.historico.huggy = [];





            saveData();



            renderHistory();




        };



    }









    if(caixaBtn){



        caixaBtn.onclick = ()=>{



            const confirmDelete =

                confirm(
                    "Apagar histórico Caixa?"
                );



            if(!confirmDelete)

                return;





            database.historico.caixa = [];





            saveData();



            renderHistory();




        };



    }









    if(globalBtn){



        globalBtn.onclick = ()=>{



            const confirmDelete =

                confirm(
                    "Apagar todo histórico?"
                );



            if(!confirmDelete)

                return;





            database.historico.huggy = [];



            database.historico.caixa = [];





            saveData();



            renderHistory();




        };



    }




}









/* =========================================================
   COUNTER
========================================================= */


function updateCount(){



    const element =

        document.getElementById(
            "history-count"
        );



    if(!element)

        return;






    element.innerText =


        (

            database.historico.huggy.length

            +

            database.historico.caixa.length

        )

        +

        " registros";



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









console.log(

    "Histórico carregado corretamente"

);