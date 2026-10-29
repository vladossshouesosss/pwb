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
            return 'легка'
        }else if(this.routeLength < 100){
            return 'посередня'
        }else{
            return 'висока'
        }
    }
}
const routes = []
routes.push(new route('Бориспіль - Багрянова гора', 33.48))
routes.push(new route('Вабля - Київ', 87.8))
routes.push(new route('Озеро Бучак', 125.62))
let totalLength = 0;
for(const route of routes){
    totalLength += route.routeLength;
}
console.log(totalLength.toFixed(2))
for(const route of routes){
    console.log(route.routeName + ' - ' + route.classifyDiffLevel())
}
// estimates duration of route trip in minutes
const estimateMinutes = km => Math.round(km / 15 * 60)
for(const route of routes){
    console.log(route.routeName + ' - ' + estimateMinutes(route.routeLength) + 'хв');
}