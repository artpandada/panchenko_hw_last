'use strict';

// eslint-disable-next-line no-undef
const token = checkLocalStorage();
if (token === null) {
    window.location.href = 'login.html';
}

class TaskListModel {
    list = [];
    #baseUrl = 'https://todo.hillel.it';
    #token = '';

    constructor(tokenValue) {
        this.#token = tokenValue;
    }

    async #request(method, url, body) {

        const headers = new Headers();
        headers.set('Authorization', `Bearer ${this.#token}`);
        headers.set('Content-Type', 'application/json');
        const response = await fetch(url, {
            method,
            headers,
            body,
        });

        return await response.json();
    }

    add(name, text, checked, priority, id) {
        const task = {
            name,
            text,
            checked,
            priority,
            id,
        };
        this.list.push(task);
    }

    async addNote(name, text, priority) {
        const value = JSON.stringify(
            {
                name,
                text,
            },
        );
        const requestBody = JSON.stringify({
            value,
            priority: Number(priority),

        });
        const note = await this.#request('POST', `${this.#baseUrl}/todo`, requestBody);
        const noteValue = await JSON.parse(note.value);
        await this.add(noteValue.name, noteValue.text, note.checked, note.priority, note._id);
    }

    async getNote() {
        const list = await this.#request('GET', `${this.#baseUrl}/todo`);

        if (!list.length) {
            return null;
        } else {
            list.forEach(item => {

                const noteValue = JSON.parse(item.value);
                const listItem = {
                    name: noteValue.name,
                    text: noteValue.text,
                    checked: item.checked,
                    priority: item.priority,
                    id: item._id,

                };
                this.list.push(listItem);
            });
        }
    }

    toggleItemNote(id) {
        return this.#request('PUT', `${this.#baseUrl}/todo/${id}/toggle`);

    }

    deleteItemNote(id) {
        return this.#request('DELETE', `${this.#baseUrl}/todo/${id}`);

    }

    changeItemNode(id, name, text, priority) {
        const value = JSON.stringify(
            {
                name,
                text,
            },
        );

        const requestBody = JSON.stringify({
            value,
            priority: Number(priority),

        });
        return this.#request('PUT', `${this.#baseUrl}/todo/${id}`, requestBody);

    }


    #getTaskIndex(task) {
        return this.list.findIndex(elem => elem.name === task.name);
    }

    checkTaskExists(task) {
        const errorIndex = -1;
        return this.#getTaskIndex(task) !== errorIndex;
    }

    async changeStatus(id) {
        await this.toggleItemNote(this.list[id].id);
        this.list[id].checked = !this.list[id].checked;


    }

    async remove(item, id) {
        await this.deleteItemNote(this.list[id].id);
        this.list = this.list.filter(({ name }) => name !== item);
    }

    getSummary() {
        return {
            total: this.list.length,
            completed: this.list.filter(({ checked }) => checked).length,
        };
    }
}

class TaskListView {
    constructor(model) {
        this.model = model;
        this.startListen();
    }

    form = document.querySelector('.add-task-form');
    btnAdd = document.querySelector('.btn-add');
    btnClose = document.querySelector('.close-form');
    taskList = document.querySelector('.tasks-list');
    total = document.querySelector('.total');
    completed = document.querySelector('.completed');
    errorMessage = document.querySelector('.error-message');
    btnLogout = document.querySelector('.btn-logout');
    select = document.querySelector('.select-task');

    initSubmit() {
        this.form.addEventListener('submit', async e => {
            e.preventDefault();

            const nameNewTask = document.querySelector('#name-new-task').value;
            const textNewTask = document.querySelector('#text-new-task').value;
            const priorityNewTask = document.querySelector('#select-new-task').value;
            const load = document.querySelector('.load-form');
            load.style.cssText = 'display:block';

            if (!this.model.checkTaskExists(this.model.list) && nameNewTask !== '' && textNewTask !== '') {

                try {
                    await this.model.addNote(nameNewTask, textNewTask, priorityNewTask);
                    this.createList();
                    this.form.classList.remove('open-form');
                    this.form.classList.remove('error');
                    this.form.reset();
                    load.style.cssText = 'display:none';

                } catch {
                    load.style.cssText = 'display:none';
                    this.form.classList.add('error');
                    this.errorMessage.innerHTML = 'Something went wrong';
                }
            } else {
                load.style.cssText = 'display:none';
                this.form.classList.add('error');
            }
        });
    }

    createList() {
        this.taskList.innerHTML = '';
        this.total.innerHTML = `All : ${this.model.getSummary().total}`;
        this.completed.innerHTML = `Ready:${this.model.getSummary().completed}`;

        if (!this.model.list.length) return;
        const fragment = new DocumentFragment();

        for (const task of this.model.list) {


            const listItem = document.createElement('li');
            listItem.dataset.id = task.name;
            listItem.classList.add(task.priority);


            const div = document.createElement('div');
            div.classList.add('wrapper-priority-checkbox');

            const priority = document.createElement('span');
            priority.innerHTML = `Task priority : ${task.priority}`;
            priority.classList.add('priority');
            div.appendChild(priority);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('status');
            div.appendChild(checkbox);


            const nameTask = document.createElement('h2');
            nameTask.innerHTML = task.name;

            const textTask = document.createElement('p');
            textTask.innerHTML = task.text;

            const wrapperBtn = document.createElement('div');
            wrapperBtn.classList.add('wrapper-btn');
            const btnEdit = document.createElement('button');
            btnEdit.textContent = 'Edit';
            btnEdit.classList.add('btn-edit');
            const btnRemove = document.createElement('button');
            btnRemove.textContent = 'Remove';
            btnRemove.classList.add('btn-remove');
            wrapperBtn.append(btnEdit, btnRemove);

            const editForm = document.createElement('form');
            editForm.classList.add('edit-form');
            const editName = document.createElement('input');
            editName.type = 'text';
            editName.classList.add('edit-name');
            const editText = document.createElement('textarea');
            editText.classList.add('edit-text');
            const select = document.createElement('select');
            select.name = 'edit-select';
            select.id = '#edit-select';
            select.classList.add('select-edit-task');
            const option1 = document.createElement('option');
            option1.value = '1';
            option1.innerHTML = 'priority task 1';
            const option2 = document.createElement('option');
            option2.value = '2';
            option2.innerHTML = 'priority task 2';
            const option3 = document.createElement('option');
            option3.value = '3';
            option3.innerHTML = 'priority task 3';
            select.append(option1, option2, option3);
            const btnEditForm = document.createElement('button');
            btnEditForm.type = 'submit';
            btnEditForm.classList.add('btn-edit-form');
            btnEditForm.innerHTML = 'Ok';
            editForm.append(editName, editText, select, btnEditForm);

            listItem.append(div, nameTask, textTask, wrapperBtn, editForm);
            fragment.prepend(listItem);

            if (task.checked) {
                listItem.classList.add('tasks-list-ready');
                checkbox.defaultChecked = true;
            }

        }
        this.taskList.append(fragment);
        this.select.value = '0';

    }

    openForm() {
        this.btnAdd.addEventListener('click', () => {
            this.form.classList.add('open-form');
        });
    }


    closeForm() {
        this.btnClose.addEventListener('click', () => {
            this.form.classList.remove('open-form');
            this.form.classList.remove('error');
        });
    }


    listListener() {
        this.taskList.addEventListener('click', (e) => {
            const element = this.findId(e.target);

            if (e.target.classList.contains('status')) {
                this.changeStatus(element.id, element.parent);

            }
            if (e.target.classList.contains('btn-edit')) {
                this.openEditForm(element.parent, element.id);
            }
            if (e.target.classList.contains('btn-remove')) {
                this.model.remove(element.parent.dataset.id, element.id).then(() => {
                    this.createList();
                    this.select.value = '0';
                    this.completed.innerHTML = `Ready : ${this.model.getSummary().completed}`;
                });

            }
        });


    }

    filter() {
        this.select.addEventListener('change', (e) => {
            const listItems = this.taskList.querySelectorAll('li');
            listItems.forEach(li => {
                if (e.target.value === '0') {
                    li.style.display = 'flex';
                } else {
                    if (li.classList.contains(e.target.value)) {
                        li.style.display = 'flex';
                    } else {
                        li.style.display = 'none';
                    }

                }

            });


        });
    }


    findId(target) {
        if (target.dataset.id) {
            const id = this.model.list.findIndex(element => element.name === target.dataset.id);
            const parent = target;
            return {
                id,
                parent,
            };
        } else {
            return this.findId(target.parentElement);
        }
    }

    changeStatus(id, element) {
        this.model.changeStatus(id)
            .then(() => {
                if (this.model.list[id].checked) {
                    element.classList.add('tasks-list-ready');
                } else {
                    element.classList.remove('tasks-list-ready');
                }
                this.completed.innerHTML = `Ready : ${this.model.getSummary().completed}`;
            })
            .finally(() => this.completed.innerHTML = `Ready : ${this.model.getSummary().completed}`);


    }

    openEditForm(element, i) {
        element.classList.add('edit');

        const nameEdit = element.querySelector('.edit-name');
        const textEdit = element.querySelector('.edit-text');
        const selectEdit = element.querySelector('.select-edit-task');

        nameEdit.value = element.querySelector('h2').textContent;
        textEdit.value = element.querySelector('p').textContent;


        element.addEventListener('submit', (e) => {
            e.preventDefault();
            this.model.changeItemNode(this.model.list[i].id, nameEdit.value, textEdit.value, selectEdit.value)
                .then(() => {
                    this.model.list[i].name = nameEdit.value;
                    this.model.list[i].text = textEdit.value;
                    this.model.list[i].priority = selectEdit.value;
                    this.createList();
                });


        });
    }

    logout() {
        this.btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.reload();
        });

    }

    startListen() {
        this.initSubmit();
        this.openForm();
        this.closeForm();
        this.listListener();
        this.logout();
        this.filter();
        this.model.getNote().then((response) => {
            if (response !== null) {
                this.createList();
            }
        });
    }
}

new TaskListView(new TaskListModel(token));





