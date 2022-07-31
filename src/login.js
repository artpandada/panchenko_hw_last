'use strict';
// eslint-disable-next-line no-undef
if (checkLocalStorage()) {
    window.location.href = 'index.html';
}

class TaskListModel {
    #baseUrl = 'https://todo.hillel.it';
    #token = '';
    #storage = localStorage;
    #registrationForm = document.querySelector('.registration-form');

    constructor() {
        this.#loginForm();
    }

    #loginForm() {
        this.#registrationForm.addEventListener('submit', e => {
            e.preventDefault();
            const load = document.querySelector('.load');
            load.style.cssText = 'display:block';
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;

            if (email !== '' && password !== '') {
                this.auth(email, password);
                this.#registrationForm.classList.remove('error');
                this.#registrationForm.reset();

            } else {
                this.#registrationForm.classList.add('error');
                load.style.cssText = 'display:none';
            }
        });
    }

    async auth(email, password) {
        const requestBody = JSON.stringify({
            value: `${email}, ${password}`,
        });
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const response = await fetch(`${this.#baseUrl}/auth/login`, {
            method: 'POST',
            headers,
            body: requestBody,
        });
        const { access_token: accessToken } = await response.json();
        this.#token = accessToken;
        const hourTimeMS = 3600;
        const msInSec = 1000;
        const key = {
            value: this.#token,
            expiration: new Date().setTime(new Date().getTime() + hourTimeMS * msInSec),
        };
        await this.#storage.setItem('token', JSON.stringify(key));
        window.location.href = 'index.html';
    }

}

new TaskListModel();



