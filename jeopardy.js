// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

let catIds = [];
 async function getCategoryIds() {
    let res = await axios.get('http://jservice.io/api/categories', { params: { count: 100 } });
    for (let i = 0; i < res.data.length; i++) {
        let catId = res.data[i].id;
        catIds.push(catId);
    }
    shuffle(catIds);
}


let catIds2 = [];
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    catIds2 = array.slice(0, 6);
    return catIds2;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
 async function getCategory(catId) {
    let res = await axios.get('http://jservice.io/api/category', { params: { id: catId } });
    let clueArr = [];
    for (let i = 0; i < 5; i++) {
        let cluesQ = {
        question: res.data.clues[i].question,
        answer: res.data.clues[i].answer,
        showing: null
    };
    clueArr.push(cluesQ);
}
    let catObj = {
        title: res.data.title,
        clues: clueArr,
    }
    return catObj;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $("#jeopardy tHead").empty();
    $("#jeopardy tBody").empty();
    const table = document.createElement('table');
    table.setAttribute('id', 'jeopardy');
    let tHead = document.createElement('thead');
    let tBody = document.createElement('tbody');
    let top = document.createElement('tr');
    document.body.insertBefore(table, document.body.firstChild);
    table.append(tHead);
    table.append(tBody);
    tHead.append(top);
    let clueIdx = 0;
    for (let i = 0; i < categories.length; i++) {
        let title = document.createElement('th');
        title.innerText = categories[i].title;
        top.append(title);
    }
    for (let i = 0; i < 5; i++) {
        let row = document.createElement('tr');
        for (let i = 0; i < categories.length; i++) {
            let question = document.createElement('td');
            question.setAttribute('id', `${i}-${clueIdx}`);
            question.innerText = "?";
            row.append(question);
            tBody.append(row);
        }
        clueIdx++;
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split('-');
    let clue = categories[catId].clues[clueId];

    let txt;

    if (!clue.showing) {
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question"){
        msg = clue.answer;
        clue.showing = "answer";
    } else {
        return;
    }
    $(`#${catId}-${clueId}`).html(msg);
}

document.addEventListener('click', handleClick)

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    await getCategoryIds();
    categories = [];
    for(let catId of catIds2) {
        categories.push(await getCategory(catId));
    }
    fillTable();
}

/** On click of start / restart button, set up game. */

let button = document.createElement('button');
button.setAttribute('id', 'restart');
document.body.insertBefore(button, document.body.firstChild);
button.innerText = "Restart Game!";

$('#restart').on('click', setupAndStart)

/** On page load, add event handler for clicking clues */

$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
  }
);