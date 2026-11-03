const lineBreaker = '\r\n'
const cards = document.querySelectorAll('.route-card');
for(const card of cards) {
    card.remove()
}
console.log('script.js підключено')
class route{
    #routeName
    #routeLength
    #diffLevel
    constructor(routeName, routeLength){
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
/*
renders all cards
creates tags, fills them with helping functions, adds them
 */
function renderCards(routes){
    listContainer.innerHTML = '';
    listContainer.append(createTagWithText('h2', 'Маршрути'))
    const divForRoutes = document.createElement('div')
    divForRoutes.classList.add('cards');
    listContainer.append(divForRoutes)
    for (const route of routes) {
        const card = document.createElement('article');
        card.append(createTagWithText('h3', route.routeName));
        card.append(createTagWithText('p', 'Довжина: ' + route.routeLength + 'км'))
        card.dataset.km = route.routeLength;
        card.classList.add(route.classifyDiffLevel());
        card.classList.add('route-card')
        card.append(createReference('Деталі маршруту' + lineBreaker, '#route-info'));
        divForRoutes.append(card);
    }
    listContainer.append(
        Object.assign(
            createTagWithText('p', 'Загальна довжина: ' + calcTotalRoutesLength(routes), 'total-km'),
            { className: 'total-card'}
        )
    );
}

renderCards(routes)
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