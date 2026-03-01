const storageKey = 'todos';

const newTodo = document.querySelector('.new-todo');
const inputText = document.querySelector('.input-text');
const todosCount = document.querySelector('.todos__count');
const buttonArrow = document.querySelector('.input-arrow');
const buttonContainer = document.querySelector('.todos__button-container');
const buttonClear = document.querySelector('.todos__button-clear button');
const buttonFilter = document.querySelectorAll('.todos__button-status button');

const todoCheckbox = '.todo-checkbox';
const todoInput = '.todos__input';

let filter = 'all';         //фильтр кнопок 
let todos = [];             //массив для задач

/*ПОКАЗ/СКРЫТИЕ ЗАДАЧИ*/
function stateTodo(e, show, type = 'block'){
    if(show){
        e.classList.add(type);
        e.classList.remove('hide');
        return;
    }
    e.classList.add('hide');
    e.classList.remove(type);
}

/*СЧИТЫВАНИЕ ВЫПОЛНЕННЫХ ЗАДАЧ*/
function countCompletedTodo(){
    return todos.filter(t => t.checked).length;
}

/*СОЗДАНИЕ ЗАДАЧИ*/
function createTodo(todo){
    const newTask = document.createElement('div');
    newTask.className = 'todos__input';
    newTask.dataset.id = todo.id;

    const newContent = document.createElement('div');
    newContent.className = 'new-todo__input';

    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.className = 'todo-checkbox';
    if(todo.checked){
        newCheckbox.checked = true;
    }

    const newText = document.createElement('span');
    newText.className = 'todo-text';
    newText.textContent = todo.text;
    
    const newDeleteBtn = document.createElement('button');
    newDeleteBtn.className = 'delete-btn';

    newContent.appendChild(newCheckbox);
    newContent.appendChild(newText);
    newContent.appendChild(newDeleteBtn);
    newTask.appendChild(newContent);
    return newTask;
}

/*СОХРАНЕНИЕ ЗАДАЧ*/
function saveTodo(){
    localStorage.setItem(storageKey, JSON.stringify(todos));
}

/*ОБНОВЛЕНИЕ UI*/
function updateUI(){
    newTodo.innerHTML = '';
    todos.forEach(todo => {
        newTodo.append(createTodo(todo));
    });
    saveTodo();        
    updateCount();
    updateFilter();
}

/*ПОКАЗ / СКРЫТИЕ ЗАДАЧ ПО ФИЛЬТР-КНОПКАМ*/
function updateFilter(){
    newTodo.querySelectorAll(todoInput).forEach(e => {
        if (!e.querySelector(todoCheckbox)) 
            return;
        
        const isChecked = e.querySelector(todoCheckbox).checked;
        const isShown = (!isChecked && filter === 'active') ||
                        (isChecked && filter === 'completed') ||
                        (filter === 'all');

        stateTodo(e, isShown, 'block');
    });
}

/*ОБНОВЛЕНИЕ КОЛ-ВА ЗАДАЧ*/
function updateCount(){
    const activeTodo = todos.length - countCompletedTodo();

    todosCount.textContent = 
    `${activeTodo} item${activeTodo == 1? '' : 's'} left`;

    stateTodo(buttonClear, countCompletedTodo() > 0, 'block');
    stateTodo(buttonContainer, todos.length > 0, 'flex');
    stateTodo(buttonArrow, todos.length > 0, 'flex');
}

/*ЗАГРУЗКА СОХРАНЕННЫХ ЗАДАЧ*/
function loadTodo(){
    const loadTodos = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if(loadTodos.length > 0 && !loadTodos[0].id){
        todos = loadTodos.map((todo, todoId) => ({
            ...todo,
            id: todoId + 1
        }));
    }
    else{
        todos = loadTodos;
    }
    updateUI();
}

loadTodo();

/*ВВОД НОВОЙ ЗАДАЧИ*/
inputText.addEventListener('keypress', function(e){
    if (e.key === 'Enter' && this.value.trim()){
        let todoId = 0;
        for(let i = 0; i < todos.length; i++){
            if(todos[i].id > todoId){
                todoId = todos[i].id;
            }
        }
        todos.unshift({
            id: todoId + 1,
            checked: false,
            text: this.value.trim()
        });
        this.value = '';
        updateUI();
    }
});

/*НАЖАТИЕ НА СТРЕЛКУ*/
buttonArrow.addEventListener('click', function(){
    const all = todos.every(e => e.checked);
    todos.forEach(e => {
        e.checked = !all;
    });
    updateUI();
});

/*УДАЛЕНИЕ ЗАДАЧ*/
newTodo.addEventListener('click', function(e){
    const isDeleteBtn = e.target.classList.contains('delete-btn');
    if (isDeleteBtn){
        const todoElement = e.target.closest(todoInput);
        if(!todoElement)
            return;

        const todoId = todoElement.dataset.id;
        const index = todos.findIndex(todo => todo.id == todoId);
        if(index !== -1){
            todos.splice(index, 1);
        updateUI();
        }
    }
});

/*ИЗМЕНЕНИЕ СОСТОЯНИЯ ЗАДАЧ*/
newTodo.addEventListener('change', function(e){
    const isCheckbox = e.target.classList.contains('todo-checkbox');
    if (isCheckbox){
        const todoElement = e.target.closest(todoInput);
        const todoId = todoElement.dataset.id;
        const todo = todos.find(e => e.id == todoId);
        if(todo){
            todo.checked = e.target.checked;
            updateUI();
        }
    }
});

/*УДАЛЕНИЕ ЗАВЕРШЕННЫХ ЗАДАЧ*/
buttonClear.addEventListener('click', function(){
    todos = todos.filter(todo => !todo.checked);
    updateUI();
});

/*ФИЛЬТР-КНОПКИ*/
buttonFilter.forEach(button =>{
    button.addEventListener('click', function(){
        buttonFilter.forEach(e =>{
            e.classList.remove('active');
        });
        this.classList.add('active');
        filter = this.dataset.state;
        updateFilter();
    });
});

/*РЕДАКТИРОВАНИЕ ЗАДАЧИ*/
newTodo.addEventListener('dblclick', function(e){
    const isTodoText = e.target.classList.contains('todo-text');
    if(isTodoText){
        const element = e.target;
        const input = document.createElement('input');
        const todoInput = element.closest('.new-todo__input');
        const todoElement = element.closest('.todos__input');
        const todoId = todoElement.dataset.id;

        const todo = todos.find(e => e.id == todoId);
        if(!todo) 
            return;

        input.className = 'todo-input-edit';
        input.value = element.textContent.trim();
        element.replaceWith(input);
        input.focus();

        todoInput.classList.add('new-todo__input--edit');

        function save(){
            if(input.value.trim()){
                todo.text = input.value.trim();
                element.textContent = input.value.trim();
            }
            input.replaceWith(element);
            todoInput.classList.remove('new-todo__input--edit');
            saveTodo();
        }
        
        function cancel(){
            input.removeEventListener('blur', save);
            input.replaceWith(element);
            todoInput.classList.remove('new-todo__input--edit');
        }

        input.addEventListener('blur', save);
        input.addEventListener('keypress', function(e){
            if(e.key === 'Enter') {
                input.blur();
            }
        });

        input.addEventListener('keydown', function(e){
            if(e.key === 'Escape') {
                e.preventDefault();
                cancel();
            }
        });
    }
});