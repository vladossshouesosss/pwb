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

    toJSON(){
        return{
            id: this.id,
            name: this.routeName,
            distanceKm: this.routeLength,
            difficulty: this.diffLevel,
        }
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

/*
adds message on user screen if input is incorrect
based on HTML constants
 */

/*
based on selector changes re-renders screen
with only routes of certain difficulty
 */

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
    const response = await fetch(URL)
    if(!response.ok){
        throw new Error(`Код ${response.status}`);
    }
    const data = await response.json()
    const inputData = document.getElementById('distanceKm');

    return data.map((record) => {
        const distance = parseFloat(
            getRandomFromRange(parseFloat(inputData.min), parseFloat(inputData.max)).toFixed(2)
        )
        return new route(`Маршрут по ${record.address.city} від ${record.name}`, distance).toJSON()
    })
}
const inputData = document.getElementById('lengthKm');

function saveToLocalStorage(items){
    localStorage.setItem('routes', JSON.stringify(items));
}
function loadFromLocalStorage(){
    try {
        const raw = localStorage.getItem('routes');
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}
const DB_NAME = 'bikeRoutesDB';
const DB_VERSION = 1;
const STORE_NAME = 'routes';
const MIGRATION_FLAG = 'routesMigratedToIDB';
const {useState} = React;
/*
opens database (creates it on first run)
onupgradeneeded runs only when database is new or version grew,
there object store "routes" with keyPath "id" is created
returns Promise with IDBDatabase
 */
function openDB(){
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB не підтримується цим браузером'));
            return;
        }
        let request;
        try {
            request = indexedDB.open(DB_NAME, DB_VERSION);
        } catch (error) {
            reject(error);
            return;
        }
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
/*
adds route to object store in readwrite transaction
put creates new record or overwrites record with the same id
 */
async function addItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/*
updates existing route found by id (keyPath)
also uses put, which replaces the whole record with the same key
 */
async function updateItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/*
reads all routes in readonly transaction
records come sorted by id
 */
async function getAllItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/*
deletes route with given id in readwrite transaction
 */
async function deleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
function RouteCards({routeName, routeDiff, routeLength, routeNumber, onEdit, onDelete}){
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
            <div className="card-actions">
                <button type="button" onClick={onEdit}>Редагувати</button>
                <button type="button" onClick={onDelete}>Видалити</button>
            </div>
        </article>
    );
}
// leaves only first route with every name
const uniqueByName = (list) => {
    const seen = new Set();
    return list.filter((r) => {
        const key = normalizeName(r.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};
// converts record of older localStorage formats into {id, name, distanceKm, difficulty}
const normalizeRoute = (r) => ({
    id: r.id,
    name: r.name ?? r.routeName,
    distanceKm: r.distanceKm ?? r.lengthKm ?? r.routeLength,
    difficulty: r.difficulty ?? r.diffLevel,
});
/*
one-time migration from localStorage to IndexedDB
if flag is not set and object store is empty, starting routes
and routes saved earlier in localStorage are moved there through addItem,
after that flag is set, so migration doesn't repeat on next launches
 */
async function migrateFromLocalStorage() {
    if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
        return;
    }
    const existing = await getAllItems();

    if (existing.length === 0) {
        const defaults = routes.map((r) => r.toJSON());
        const defaultNames = new Set(defaults.map((r) => normalizeName(r.name)));
        // skip broken records and copies of starting routes
        const stored = uniqueByName(
            loadFromLocalStorage()
                .map(normalizeRoute)
                .filter((r) => r.name && !defaultNames.has(normalizeName(r.name)))
        );

        const toAdd = [...defaults, ...withUniqueIds(defaults, stored)];
        for (const item of toAdd) {
            await addItem(item);
        }
        console.log(`Міграція з localStorage: перенесено ${toAdd.length} записів`);
    }

    localStorage.setItem(MIGRATION_FLAG, 'true');
}
const withUniqueIds = (existing, newRoutes) => {
    let nextId = existing.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
    return newRoutes.map((r) => ({ ...r, id: ++nextId }));
};
const normalizeName = (name) => String(name).trim().toLowerCase();
// pseudo-random number from 0 to 1, always the same for the same seed
const seeded = (seed) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
};

/*
builds points of route line on schematic map
every route goes from city center in its own direction,
its length on the map is proportional to distanceKm
 */
function buildRoutePoints(route, index, total, maxKm, center){
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const length = 60 + (Number(route.distanceKm) / maxKm) * 200;
    const steps = 5;
    const points = [[center.x, center.y]];
    for (let i = 1; i <= steps; i++) {
        const along = length * (i / steps);
        const wiggle = (seeded(Number(route.id) * 10 + i) - 0.5) * (i < steps ? 40 : 12);
        points.push([
            center.x + Math.cos(angle) * along - Math.sin(angle) * wiggle,
            center.y + Math.sin(angle) * along + Math.cos(angle) * wiggle,
        ]);
    }
    return points;
}

/*
schematic map of saved routes
gets the same array that came from getAllItems
color of the line shows difficulty, length of the line shows distance
 */
function RoutesMap({ items }){
    const width = 800;
    const height = 600;
    const center = { x: width / 2, y: height / 2 };
    const maxKm = Math.max(...items.map((r) => Number(r.distanceKm) || 0), 1);
    const totalKm = items.reduce((sum, r) => sum + (Number(r.distanceKm) || 0), 0);

    return (
        <svg className="routes-map" viewBox={`0 0 ${width} ${height}`} role="img"
             aria-label="Умовна карта збережених маршрутів">
            <rect width={width} height={height} fill="#e9e4cf"/>
            {Array.from({ length: 14 }, (_, i) => (
                <line key={'v' + i} x1={i * 60} y1="0" x2={i * 60} y2={height} stroke="#d8d0b3"/>
            ))}
            {Array.from({ length: 11 }, (_, i) => (
                <line key={'h' + i} x1="0" y1={i * 60} x2={width} y2={i * 60} stroke="#d8d0b3"/>
            ))}
            <path d="M 500 0 C 450 150, 540 250, 470 360 S 440 520, 510 600"
                  fill="none" stroke="#9cc8e6" strokeWidth="26" strokeLinecap="round"/>

            {items.map((r, i) => {
                const points = buildRoutePoints(r, i, items.length, maxKm, center);
                const [endX, endY] = points[points.length - 1];
                const color = diffColors[r.difficulty] ?? '#666666';
                return (
                    <g key={r.id}>
                        <title>{`№${r.id} ${r.name} — ${r.distanceKm} км`}</title>
                        <polyline points={points.map((p) => p.join(',')).join(' ')}
                                  fill="none" stroke={color} strokeWidth="5"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx={endX} cy={endY} r="13" fill="#ffffff" stroke={color} strokeWidth="3"/>
                        <text x={endX} y={endY} textAnchor="middle" dominantBaseline="central"
                              fontSize="12" fontWeight="bold" fill="#161616">{r.id}</text>
                    </g>
                );
            })}

            <circle cx={center.x} cy={center.y} r="14" fill="#0B3012"/>
            <text x={center.x} y={center.y - 24} textAnchor="middle" fontSize="14" fontWeight="bold"
                  fill="#0B3012" stroke="#e9e4cf" strokeWidth="4" paintOrder="stroke">Центр міста</text>

            {items.length === 0 && (
                <text x={center.x} y={center.y + 50} textAnchor="middle" fontSize="18" fill="#4A5844">
                    Немає збережених маршрутів
                </text>
            )}

            <g transform={`translate(16, ${height - 116})`}>
                <rect width="230" height="100" rx="6" fill="#ffffff" opacity="0.9"/>
                {Object.entries(diffColors).map(([level, color], i) => (
                    <g key={level} transform={`translate(12, ${20 + i * 22})`}>
                        <line x1="0" y1="0" x2="26" y2="0" stroke={color} strokeWidth="5" strokeLinecap="round"/>
                        <text x="36" y="0" dominantBaseline="central" fontSize="13" fill="#161616">
                            {diffLabels[level]}
                        </text>
                    </g>
                ))}
                <text x="12" y="88" fontSize="13" fill="#161616">
                    {`Маршрутів: ${items.length}, разом ${totalKm.toFixed(1)} км`}
                </text>
            </g>
        </svg>
    );
}
const diffColors = {
    'easy-level': '#32cd32',
    'medium-level': '#ffa500',
    'hard-level': '#ff0000',
};
const emptyForm = { name: '', lengthKm: '', difficulty: 'null' };

function App() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // 'loading' | 'ready' | 'error'
    const [dbStatus, setDbStatus] = useState('loading');

    const isReady = dbStatus === 'ready';

    const visibleItems = form.difficulty === 'null'
        ? items
        : items.filter((r) => r.difficulty === form.difficulty);

    // re-renders the list with data from IndexedDB, called after every CRUD operation
    const refresh = async () => {
        setItems(await getAllItems());
    };

    // on first render: open database, migrate data, show routes
    React.useEffect(() => {
        (async () => {
            try {
                await openDB();
                await migrateFromLocalStorage();
                await refresh();
                setDbStatus('ready');
            } catch (error) {
                console.error('Помилка IndexedDB:', error);
                setDbStatus('error');
                // show at least starting routes, so page is not empty
                setItems(routes.map((r) => r.toJSON()));
            }
        })();
    }, []);

    // adds routes which names are not taken yet, returns added ones
    const addRoutes = async (newRoutes) => {
        const current = await getAllItems();
        const taken = new Set(current.map((r) => normalizeName(r.name)));

        const unique = newRoutes.filter((r) => {
            const key = normalizeName(r.name);
            if (taken.has(key)) return false;
            taken.add(key);
            return true;
        });

        const prepared = withUniqueIds(current, unique);
        for (const r of prepared) {
            await addItem(r);
        }
        await refresh();
        return prepared;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setMessage('');
    };

    const resetForm = () => {
        setEditingId(null);
        setForm((prev) => ({ ...emptyForm, difficulty: prev.difficulty }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.difficulty === 'null') {
            setMessage('Оберіть рівень складності для маршруту');
            return;
        }

        const routeData = {
            name: form.name.trim(),
            distanceKm: Number(form.distanceKm),
            difficulty: form.difficulty,
        };

        try {
            if (editingId !== null) {
                const nameTaken = items.some(
                    (r) => r.id !== editingId && normalizeName(r.name) === normalizeName(routeData.name)
                );
                if (nameTaken) {
                    setMessage(`Маршрут «${routeData.name}» вже існує`);
                    return;
                }
                await updateItem({ id: editingId, ...routeData });
                await refresh();
                resetForm();
                return;
            }

            const added = await addRoutes([routeData]);
            if (added.length === 0) {
                setMessage(`Маршрут «${routeData.name}» вже існує`);
                return;
            }
            resetForm();
        } catch (error) {
            console.error(error);
            setMessage('Не вдалося зберегти маршрут');
        }
    };

    // puts route data into form, submit will update it instead of adding
    const handleEdit = (r) => {
        setEditingId(r.id);
        setForm({ name: r.name, distanceKm: String(r.distanceKm), difficulty: r.difficulty });
        setMessage('');
    };

    const handleDelete = async (id) => {
        try {
            await deleteItem(id);
            if (editingId === id) resetForm();
            await refresh();
        } catch (error) {
            console.error(error);
            setMessage('Не вдалося видалити маршрут');
        }
    };

    const handleLoadCommunity = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const newRoutes = await loadData();
            const added = await addRoutes(newRoutes);
            if (added.length === 0) setMessage('Нових маршрутів немає');
        } catch (err) {
            console.error(err);
            setMessage('Не вдалося завантажити маршрути');
        } finally {
            setIsLoading(false);
        }
    };

    // clears message and re-reads the list from database
    const handleRefresh = async () => {
        setMessage('');
        if (isReady) {
            await refresh();
        }
    };

    // the map lives in another section of the page, so it is rendered there through portal
    const mapRoot = document.getElementById('routes-map');

    return (
        <div className="routes-panel">
            {mapRoot && ReactDOM.createPortal(<RoutesMap items={items}/>, mapRoot)}
            <div className="cards">
                {dbStatus === 'loading' && <p>Завантаження маршрутів…</p>}
                {visibleItems.map((r) => (
                    <RouteCards
                        key={r.id}
                        routeNumber={r.id}
                        routeName={r.name}
                        routeLength={r.distanceKm}
                        routeDiff={r.difficulty}
                        onEdit={() => handleEdit(r)}
                        onDelete={() => handleDelete(r.id)}
                    />
                ))}
            </div>

            <form className="omni-card" id="route-add-form" onSubmit={handleSubmit}>
                {dbStatus === 'error' && (
                    <p className="form-message">
                        Не вдалося відкрити сховище даних (IndexedDB). Можливо, браузер у режимі
                        приватного перегляду або блокує збереження даних. Маршрути не зберігатимуться.
                    </p>
                )}
                <p>
                    <label htmlFor="name">Введіть ім'я</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        minLength={3}
                        maxLength={75}
                        value={form.name}
                        onChange={handleChange}
                    />
                </p>
                <p>
                    <label htmlFor="distanceKm">Довжина маршруту:</label>
                    <input
                        type="number"
                        id="distanceKm"
                        name="distanceKm"
                        required
                        min="0.1"
                        max="300"
                        step="any"
                        value={form.distanceKm}
                        onChange={handleChange}
                    />
                </p>
                <label htmlFor="diff-select">Виберіть рівень складності</label>
                <select
                    id="diff-select"
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                >
                    <option value="null">Усі</option>
                    <option value="easy-level">Легкий</option>
                    <option value="medium-level">Середній</option>
                    <option value="hard-level">Високий</option>
                </select>

                {message && <p className="form-message">{message}</p>}

                <div className="form-buttons" id="form-buttons">
                    <button type="submit" disabled={!isReady}>
                        {editingId !== null ? 'Зберегти зміни' : 'Додати маршрут'}
                    </button>
                    {editingId !== null ? (
                        <button type="button" onClick={resetForm}>Скасувати</button>
                    ) : (
                        <button type="button" onClick={handleLoadCommunity} disabled={isLoading || !isReady}>
                            {isLoading ? 'Завантаження…' : 'Маршрути від користувачів'}
                        </button>
                    )}
                    <button type="button" onClick={handleRefresh}>Оновити</button>
                </div>
            </form>
        </div>
    );
}
ReactDOM.createRoot(document.getElementById('routes-root')).render(<App />);



