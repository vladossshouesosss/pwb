const URL = 'https://jsonplaceholder.typicode.com/users'
const lineBreaker = '\r\n'
const cards = document.querySelectorAll('.route-card');
for(const card of cards) {
    card.remove()
}
console.log('script.js підключено')
const avgSpeed = 15
class route{
    static #nextId = 1
    #id
    #routeName
    #routeLength
    #diffLevel
    constructor(routeName, routeLength){
        this.#id = route.#nextId++
        if(routeName !== ""){
            this.#routeName = routeName;
        }else{
            this.#routeName = 'Невідома';
        }
        if(routeLength > 0){
            this.#routeLength = routeLength;
            this.#diffLevel = this.classifyDiffLevel()
        }else{
            this.#routeLength = 'Невідома';
            this.#diffLevel = 'Невідома';
        }

    }
    // returns unique id of the route
    get id(){
        return this.#id;
    }
    // returns name of the route
    get routeName(){
        return this.#routeName;
    }
    // returns length of the route
    get routeLength(){
        return this.#routeLength;
    }
    // returns difficulty level of the route
    get diffLevel(){
        return this.#diffLevel;
    }

    //classifies route difficulty level based on its length
    classifyDiffLevel(){
        if(this.routeLength < 50){
            return 'easy-level'
        }else if(this.routeLength < 100){
            return 'medium-level'
        }else{
            return 'hard-level'
        }
    }
    // calculates total length of routes chosen
    static calcTotalRoutesLength(routes){
        let totalLength = 0;
        for(const route of routes){
            totalLength += route.routeLength;
        }
        return totalLength;
    }
}
const diffLabels = {
    'easy-level': 'легка',
    'medium-level': 'середня',
    'hard-level': 'складна',
};
const routes = []
routes.push(new route('Бориспіль - Багрянова гора', 33.48))
routes.push(new route('Вабля - Київ', 87.8))
routes.push(new route('Озеро Бучак', 125.62))
const listContainer = document.querySelector('#routes')
/*
creates tag based on argument, fills it with text and returns it
if id isn't null adds it
*/
function createTagWithText(tag, text, id = null){
    const data = document.createElement(tag)
    data.textContent = text
    if(id){
        data.id = id
    }
    return data
}
/*
creates reference to certain place on page based on argument
with some name based on argument
 */
function createReference(refName, refTo){
    const ref = createTagWithText('a', refName);
    ref.href = refTo;
    return ref;
}
/*
calculates total length of all routes using dataset
 */
function calcTotalRoutesLength(){
    const routes = document.querySelectorAll('.route-card');
    let total = 0
    for(const route of routes){
        total += Number(route.dataset.km)
    }
    return total;
}
const form = document.querySelector('#route-add-form');
/*
submit event handler, prevents from reloading page
takes data from form, creates new route based on it
and re-renders the cards
 */
form.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(form);
    const routeName = formData.get('name');
    const routeLength = Number(formData.get('lengthKm'));
    routes.push(new route(routeName, routeLength));
    renderCards(routes);
    form.reset();
})
/*
adds message on user screen if input is incorrect
based on HTML constants
 */
form.addEventListener('input', (event) => {
    const inputLength = document.querySelector('#lengthKm');
    const inputName = document.querySelector('#name');
    const lengthVal = Number(inputLength.value);
    const minVal = Number(inputLength.min);
    const maxVal = Number(inputLength.max);
    const minNameLength = inputName.minLength;
    if (inputLength.value !== '' && (lengthVal > maxVal || lengthVal < minVal)) {
        inputLength.setCustomValidity(`Будь ласка, введіть маршрут з довжиною у межах ${minVal} - ${maxVal} км`);
    } else {
        inputLength.setCustomValidity('');
    }
    if (inputName.value.trim().length < minNameLength) {
        inputName.setCustomValidity(`Будь ласка, введіть маршрут з назвою не меншою за ${minNameLength} символи`);
    } else {
        inputName.setCustomValidity('');
    }
})
const filterSelect = document.querySelector('#diff-select');
/*
based on selector changes re-renders screen
with only routes of certain difficulty
 */
filterSelect.addEventListener('change', () => {
    const selectedFilter = filterSelect.value;
    renderCards(routes, selectedFilter);
});
/*
renders all cards
creates tags, fills them with helping functions, adds them
 */
function renderCards(routes, filter=null){
    listContainer.innerHTML = '';
    listContainer.append(createTagWithText('h2', 'Маршрути'))
    const divForRoutes = document.createElement('div')
    divForRoutes.classList.add('cards');
    listContainer.append(divForRoutes)
    for (const route of routes) {
        if (filter === null || filter === 'null' || route.classifyDiffLevel() === filter) {
            const card = document.createElement('article');
            card.append(createTagWithText('h3', route.routeName));
            card.append(createTagWithText('p', 'Довжина: ' + route.routeLength + 'км'))
            card.dataset.km = route.routeLength;
            card.classList.add(route.classifyDiffLevel());
            card.classList.add('route-card')
            card.append(createReference('Деталі маршруту' + lineBreaker, '#route-info'));
            divForRoutes.append(card);
        }
    }
    listContainer.append(
        Object.assign(
            createTagWithText('p', 'Загальна довжина: ' + calcTotalRoutesLength(routes).toFixed(2), 'total-km'),
            { className: 'omni-card'}
        )
    );
    listContainer.append(form)
}
/*
    removed due to react render
 */
//renderCards(routes)
console.log(route.calcTotalRoutesLength(routes).toFixed(2))
for (const route of routes) {
    console.log(route.routeName + ' - ' + route.classifyDiffLevel())
}
// estimates duration of route trip in minutes
const estimateMinutes = km => Math.round(km / 15 * 60)
for (const route of routes) {
    console.log(route.routeName + ' - ' + estimateMinutes(route.routeLength) + 'хв');
}
console.log(calcTotalRoutesLength())
/*
returns random number from range
including its end
 */
function getRandomFromRange(min, max){
    return Math.random() * (max - min + Number.EPSILON) + min;
}
/*
gets data from api, turns it into array of JSONs
then adds to array of routes each route
with name of authors and city where route is located
uses random function for length since there are no data
about it in api
 */
async function loadData(){
    try {
        comRoutesButton.disabled = true;
        const response = await fetch(URL)
        if(!response.ok){
            throw new Error(`Код ${response.statusText}`);
        }
        const data = await response.json()
        const inputData = document.getElementById('lengthKm');
        for(const record of data){
            const distance = parseFloat(getRandomFromRange(parseFloat(inputData.min), parseFloat(inputData.max)).toFixed(2))
            routes.push(new route(`Маршрут по ${record.address.city} від ${record.name}`, distance))
        }
        renderCards(routes);
    }catch(error){
        if(!document.getElementById('error-msg')){
            form.append(createTagWithText('p', 'Не вдалося отримати дані про маршрути.Спробуйте, будь ласка, пізніше', 'error-msg'))
        }
        console.error(error)
        document.getElementById('form-buttons').append(updButton)
        document.getElementById('com-routes-button').remove();
    }
    finally {
        comRoutesButton.disabled = false;

    }
}
const inputData = document.getElementById('lengthKm');
console.log(getRandomFromRange(parseFloat(inputData.min), parseFloat(inputData.max)).toFixed(2))
const comRoutesButton = document.getElementById('com-routes-button');
/*
this button calls function that gets data from api and redraws page after
 */
comRoutesButton.addEventListener('click', (event) => {
    event.preventDefault()
    loadData();
})
const updButton = document.getElementById('com-routes-update');
const routesButton = document.getElementById('com-routes-button');
updButton.remove()
/*
this button appears only if error is thrown
removes community routes button
if data is successfully loaded, removes itself
and adds community routes button back
 */
updButton.addEventListener('click', (event) => {
    event.preventDefault()
    loadData();
    document.getElementById('com-routes-update')?.remove();
    document.getElementById('error-msg').remove();
    document.getElementById('form-buttons').append(routesButton)
})
const {useState} = React;

function RouteCards({routeName, routeDiff, routeLength, routeNumber}){
    return(
      <article className="route-card">
        <h3>Маршрут №{routeNumber}</h3>
          <p>Назва: {routeName}
              <br/>
              Довжина: {routeLength}км
              <br/>
              Прогнозований час: {Math.round(routeLength / avgSpeed * 60)} хв.
              <br/>
              Складність: <span className={routeDiff}>{diffLabels[routeDiff] ?? 'Невідома'}</span>
          </p>
          <a href="#route-info">Деталі маршруту</a>
      </article>
    );
}
function App() {
    const [items, setItems] = React.useState(routes);
    return (
        <div className="cards">
            {items.map((r) => (
                <RouteCards
                    key={r.id}
                    routeNumber={r.id}
                    routeName={r.routeName}
                    routeLength={r.routeLength}
                    routeDiff={r.diffLevel}
                />
            ))}
        </div>
    );

}
ReactDOM.createRoot(document.getElementById('routes-root')).render(<App />);