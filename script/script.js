const newTodo = document.querySelector('.new-todo');
const inputText = document.querySelector('.input-text');
const todosCount = document.querySelector('.todos__count');
const buttonArrow = document.querySelector('.input-arrow');
const buttonContainer = document.querySelector('.todos__button-container');
const buttonClear = document.querySelector('.todos__button-clear button');
const buttonFilter = document.querySelectorAll('.todos__button-status button');

const todoCheckbox = '.todo-checkbox';
const todoInput = '.todos__input';

let countTodo = 0;          //кол-во задач
let countCompleted = 0;     //кол-во выполненных задач
let filter = 'all';         //фильтр кнопок 
let todos = [];             //массив для задач

loadTodo();

/*СОХРАНЕНИЕ ЗАДАЧ*/
function saveTodo(){
    localStorage.setItem('todos', JSON.stringify(todos));
}

/*ОБНОВЛЕНИЕ МАССИВ ЗАДАЧ*/
function updateTodos(){
    todos = [];
    document.querySelectorAll('.todos__input .new-todo__input').forEach(e =>{
        todos.push({
            checked: e.querySelector(todoCheckbox).checked,
            text: e.querySelector('.todo-text').textContent
        });
    });
}

/*ПОКАЗ / СКРЫТИЕ ЗАДАЧ ПО ФИЛЬТР-КНОПКАМ*/
function updateFilter(){
    newTodo.querySelectorAll(todoInput).forEach(e => {
        if (!e.querySelector(todoCheckbox)) 
            return;
        
        if(filter === 'active'){
            if(e.querySelector(todoCheckbox).checked){
                e.classList.add('hide');
                e.classList.remove('show');
            }
            else{
                e.classList.add('show');               
                e.classList.remove('hide'); 
            }
        }
        else if(filter === 'completed'){
            if(e.querySelector(todoCheckbox).checked){
                e.classList.add('show');
                e.classList.remove('hide');
            }
            else{
                e.classList.add('hide');
                e.classList.remove('show');               
            }
        }
        else{
            e.classList.add('show');
            e.classList.remove('hide');
        }
    });
}

/*ОБНОВЛЕНИЕ КОЛ-ВА ЗАДАЧ*/
function updateCount(){
    todosCount.textContent = 
    `${countTodo - countCompleted} item${countTodo - countCompleted == 1? '' : 's'} left`;

    if(countCompleted > 0){
        buttonClear.classList.add('show');
        buttonClear.classList.remove('hide');
    }
    else{
        buttonClear.classList.add('hide');        
        buttonClear.classList.remove('show');
    }

    if(countTodo === 0){
        buttonContainer.classList.add('hide');
        buttonContainer.classList.remove('show');
        buttonArrow.classList.add('hide');
        buttonArrow.classList.remove('show');
    }
    else{
        buttonContainer.classList.add('show');
        buttonContainer.classList.remove('hide');
        buttonArrow.classList.add('show');
        buttonArrow.classList.remove('hide');
    }
}

/*ЗАГРУЗКА СОХРАНЕННЫХ ЗАДАЧ*/
function loadTodo(){
    todos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos.forEach(todo =>{
        const newTask = document.createElement('div');
        newTask.className = 'todos__input';
        newTask.innerHTML = 
            `<div class="new-todo__input">
                <input type="checkbox" class="todo-checkbox" ${todo.checked ? 'checked' : ''}>
                <span class= "todo-text"> ${todo.text} </span>
                <button class="delete-btn"></button>
            </div>`;
        newTodo.append(newTask);   
        countTodo++;
        if(todo.checked) countCompleted++;     
    });

    if(countTodo > 0){
        buttonContainer.classList.add('show');
        buttonContainer.classList.remove('hide');
        buttonArrow.classList.add('show');
        buttonArrow.classList.remove('hide');
        updateCount();
        updateFilter();
    }
}

/*ВВОД НОВОЙ ЗАДАЧИ*/
inputText.addEventListener('keypress', function(e){
    if (e.key === 'Enter' && this.value.trim()){
        if (countTodo === 0){
            buttonContainer.classList.add('show');
            buttonContainer.classList.remove('hide');
            buttonArrow.classList.add('show');
            buttonArrow.classList.remove('hide');
        }
        const newTask = document.createElement('div');
        newTask.className = 'todos__input';
        newTask.innerHTML = 
            `<div class="new-todo__input">
                <input type="checkbox" class="todo-checkbox">
                <span class= "todo-text"> ${this.value.trim()} </span>
                <button class="delete-btn"></button>
            </div>`;
        newTodo.prepend(newTask);
        this.value = '';
        countTodo++;
        updateTodos();
        saveTodo();        
        updateCount();
        updateFilter();
    }
});

/*НАЖАТИЕ НА СТРЕЛКУ*/
buttonArrow.addEventListener('click', function(){
    const checkboxes = document.querySelectorAll(todoCheckbox);
    const all = Array.from(checkboxes).every(e => e.checked);
    checkboxes.forEach(e => {
        e.checked = !all;
    });
    countCompleted = all ? 0 : checkboxes.length;
    updateTodos();
    saveTodo();    
    updateCount();
    updateFilter();
});

/*УДАЛЕНИЕ ЗАДАЧ*/
newTodo.addEventListener('click', function(e){
    if (e.target.classList.contains('delete-btn')){
        if (!e.target.closest(todoInput)) 
            return;
        if (e.target.closest(todoInput).querySelector(todoCheckbox).checked){
            countCompleted--;
        }
        e.target.closest(todoInput).remove(); 
        countTodo--;
        updateTodos();
        saveTodo();        
        updateCount();
        updateFilter();

        if (countTodo === 0){
            buttonContainer.classList.add('hide');
            buttonContainer.classList.remove('show');
            buttonArrow.classList.add('hide');
            buttonArrow.classList.remove('show');
        }
    }
});

/*ИЗМЕНЕНИЕ СОСТОЯНИЯ ЗАДАЧ*/
newTodo.addEventListener('change', function(e){
    if (e.target.classList.contains('todo-checkbox')){
        if (e.target.checked){
            countCompleted++;
        }
        else{
            countCompleted--;
        }
        updateTodos();
        saveTodo();        
        updateCount();
        updateFilter();
    }
});

/*УДАЛЕНИЕ ЗАВЕРШЕННЫХ ЗАДАЧ*/
buttonClear.addEventListener('click', function(){
    newTodo.querySelectorAll(todoInput).forEach(e =>{
        if(e.querySelector(todoCheckbox).checked){
            e.remove();
            countTodo--;
            countCompleted--;
        }
    });
    updateTodos();
    saveTodo();    
    updateCount();
    updateFilter();
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
    if(e.target.classList.contains('todo-text')){
        const element = e.target;
        const input = document.createElement('input');
        const todoInput = element.closest('.new-todo__input')

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
            }
            input.replaceWith(element);
            todoInput.classList.remove('new-todo__input--edit');
            updateTodos();
            saveTodo();
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