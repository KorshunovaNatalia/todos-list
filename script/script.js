let counttodo = 0;          //кол-во задач
let countcompeled = 0;      //кол-во выполненых задач
let filter = 'all';

loadTodo();

/*ВВОД НОВОЙ ЗАДАЧИ*/
document.querySelector('.input-text').addEventListener('keypress', function(e){
    if (e.key === 'Enter' && this.value.trim()){
        if (counttodo === 0){
            document.querySelector('.todos__button-container').style.display = 'flex';
            document.querySelector('.input-arrow').style.display = 'flex';
        }
        const newtask = document.createElement('div');
        newtask.className = 'todos__input';
        newtask.innerHTML = 
            `<div class="new-todo__input">
                <input type="checkbox" class="todo-checkbox">
                <p style="flex: 1;"> ${this.value.trim()} </p>
                <button class="delete-button"></button>
            </div>`;
        document.querySelector('.new-todo').prepend(newtask);
        this.value = '';
        counttodo++;
        updatecount();
        updatefilter();
        saveTodo();
    }
});

/*НАЖАТИЕ НА СТРЕЛКУ*/
document.querySelector('.input-arrow').addEventListener('click', function(){
    const checkboxes = document.querySelectorAll('.todo-checkbox');
    const all = Array.from(checkboxes).every(e => e.checked);
    checkboxes.forEach(e => {
        e.checked = !all;
    });
    countcompeled = all ? 0 : checkboxes.length;
    updatecount();
    updatefilter();
    saveTodo();
});

/*УДАЛЕНИЕ ЗАДАЧ*/
document.querySelector('.new-todo').addEventListener('click', function(e){
    if (e.target.classList.contains('delete-button')){
        if (!e.target.closest('.todos__input')) 
            return;
        if (e.target.closest('.todos__input').querySelector('.todo-checkbox').checked){
            countcompeled--;
        }
        e.target.closest('.todos__input').remove(); 
        counttodo--;
        updatecount();
        updatefilter();
        saveTodo();
        if (counttodo === 0){
            document.querySelector('.todos__button-container').style.display = 'none';
            document.querySelector('.input-arrow').style.display = 'none';
        }
    }
});

/*ИЗМЕНЕНИЕ СОСТОЯНИЯ ЗАДАЧ*/
document.querySelector('.new-todo').addEventListener('change', function(e){
    if (e.target.classList.contains('todo-checkbox')){
        if (e.target.checked){
            countcompeled++;
        }
        else{
            countcompeled--;
        }
        updatecount();
        updatefilter();
        saveTodo();
    }
});

/*УДАЛЕНИЕ ЗАВЕРШЕННЫХ ЗАДАЧ*/
document.querySelector('.todos__button-clear a').addEventListener('click', function(){
    document.querySelectorAll('.new-todo .todos__input').forEach(e =>{
        if(e.querySelector('.todo-checkbox').checked){
            e.remove();
            counttodo--;
            countcompeled--;
        }
    });
    updatecount();
    updatefilter();
    saveTodo();
});

/*ФИЛЬТР-КНОПКИ*/
document.querySelectorAll('.todos__button-status button').forEach((button, i) =>{
    button.addEventListener('click', function(){
        document.querySelectorAll('.todos__button-status button').forEach(e =>{
            e.classList.remove('active');
        });
        this.classList.add('active');
        filter = ['all', 'active', 'completed'][i];
        updatefilter();
        saveTodo();
    });
});

/*РЕДАКТИРОВАНИЕ ЗАДАЧИ*/
document.querySelector('.new-todo').addEventListener('dblclick', function(e){
    if(e.target.tagName === 'P'){
        const element = e.target;
        const input = document.createElement('input');
        input.value = element.textContent.trim();
        element.replaceWith(input);
        input.focus();
        input.closest('.new-todo__input').style.border = '1px solid #50523b';

        let flag = false;

        function save(){
            if(flag) return;
            flag = true;

            if(input.value.trim()){
                element.textContent = input.value.trim();
            }
            input.replaceWith(element);
            element.closest('.new-todo__input').style.border = 'none';
            saveTodo();
        }
        
        function cancel(){
            if(flag) return;
            flag = true;

            input.replaceWith(element);
            element.closest('.new-todo__input').style.border = 'none';
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

/*ОБНОВЛЕНИЕ КОЛ-ВА ЗАДАЧ*/
function updatecount(){
    document.querySelector('.todos__count').textContent = 
    `${counttodo - countcompeled} item${counttodo - countcompeled == 1? '' : 's'} left`;

    if(countcompeled > 0){
        document.querySelector('.todos__button-clear a').style.display = 'block';
    }
    else{
        document.querySelector('.todos__button-clear a').style.display = 'none';
    }

    if(counttodo === 0){
        document.querySelector('.todos__button-container').style.display = 'none';
        document.querySelector('.input-arrow').style.display = 'none';
    }
}

/*ПОКАЗ / СКРЫТИЕ ЗАДАЧ ПО ФИЛЬТР-КНОПКАМ*/
function updatefilter(){
    document.querySelectorAll('.new-todo .todos__input').forEach(e => {
        if (!e.querySelector('.todo-checkbox')) 
            return;
        e.style.display = filter === 'active'? (e.querySelector('.todo-checkbox').checked ? 'none' : 'block'):
        e.style.display = filter === 'completed'? (e.querySelector('.todo-checkbox').checked ? 'block' : 'none'): 'block';
    });
}

/*СОХРАНЕНИЕ ЗАДАЧ*/
function saveTodo(){
    const todo = [];
    document.querySelectorAll('.todos__input .new-todo__input').forEach(e =>{
        todo.push({
            checked: e.querySelector('.todo-checkbox').checked,
            text: e.querySelector('p').textContent
        });
    });
    localStorage.setItem('todos', JSON.stringify(todo));
}

/*ЗАГРУЗКА СОХРАНЕНННЫХ ЗАДАЧ*/
function loadTodo(){
    const save = JSON.parse(localStorage.getItem('todos') || '[]');
    save.forEach(todo =>{
        const newtask = document.createElement('div');
        newtask.className = 'todos__input';
        newtask.innerHTML = 
            `<div class="new-todo__input">
                <input type="checkbox" class="todo-checkbox" ${todo.checked ? 'checked' : ''}>
                <p style="flex: 1;"> ${todo.text} </p>
                <button class="delete-button"></button>
            </div>`;
        document.querySelector('.new-todo').append(newtask);   
        counttodo++;
        if(todo.checked) countcompeled++;     
    });

    if(counttodo > 0){
        document.querySelector('.todos__button-container').style.display = 'flex';
        document.querySelector('.input-arrow').style.display = 'flex';
        updatecount();
        updatefilter();
    }
}