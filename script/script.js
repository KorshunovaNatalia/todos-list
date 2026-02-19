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
    let count = 0;
    for(let i = 0; i < todos.length; i++){
        if(todos[i].checked) count++;
    }
    return count;
}

/*СОЗДАНИЕ ЗАДАЧИ*/
function createTodo(todo){
    const newTask = document.createElement('div');
    newTask.className = 'todos__input';
    newTask.innerHTML = 
        `<div class="new-todo__input">
            <input type="checkbox" class="todo-checkbox" ${todo.checked ? 'checked' : ''}>
            <span class= "todo-text"> ${todo.text} </span>
            <button class="delete-btn"></button>
        </div>`;
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
    todos = JSON.parse(localStorage.getItem(storageKey) || '[]');
    updateUI();
}

loadTodo();

/*ВВОД НОВОЙ ЗАДАЧИ*/
inputText.addEventListener('keypress', function(e){
    if (e.key === 'Enter' && this.value.trim()){
        todos.unshift({
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
        if (!e.target.closest(todoInput)) 
            return;
        const index = Array.from(newTodo.querySelectorAll(todoInput)).indexOf(e.target.closest(todoInput));
        todos.splice(index, 1);
        updateUI();
    }
});

/*ИЗМЕНЕНИЕ СОСТОЯНИЯ ЗАДАЧ*/
newTodo.addEventListener('change', function(e){
    const isCheckbox = e.target.classList.contains('todo-checkbox');
    if (isCheckbox){
        const todoElement = e.target.closest(todoInput);
        const index = Array.from(newTodo.querySelectorAll(todoInput)).indexOf(todoElement);
        todos[index].checked = e.target.checked;
        updateUI();
    }
});

/*УДАЛЕНИЕ ЗАВЕРШЕННЫХ ЗАДАЧ*/
buttonClear.addEventListener('click', function(){
    newTodo.querySelectorAll(todoInput).forEach(e =>{
        const isCompleted = e.querySelector(todoCheckbox).checked;
        if(isCompleted){
            e.remove();
        }
    });
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
        const index = Array.from(newTodo.querySelectorAll('.todos__input')).indexOf(todoElement);

        input.className = 'todo-input-edit';
        input.value = element.textContent.trim();
        element.replaceWith(input);
        input.focus();

        todoInput.classList.add('new-todo__input--edit');

        let flag = false;

        function save(){
            if(flag) return;
            flag = true;

            if(input.value.trim()){
                element.textContent = input.value.trim();
                todos[index].text = input.value.trim();
            }
            input.replaceWith(element);
            todoInput.classList.remove('new-todo__input--edit');
            updateUI();
        }
        
        function cancel(){
            if(flag) return;
            flag = true;

            input.replaceWith(element);
            todoInput.classList.remove('new-todo__input--edit');
        }

        input.addEventListener('blur', save);
        input.addEventListener('keypress', function(e){
            if(e.key === 'Enter') save();
        });
        input.addEventListener('keydown', function(e){
            if(e.key === 'Escape') cancel();
        });
    }
});