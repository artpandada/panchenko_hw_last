'use strict';

// eslint-disable-next-line no-unused-vars
function checkLocalStorage() {
    if (!localStorage.getItem('token')) {
        return null;
    }
    const item = JSON.parse(localStorage.getItem('token'));
    const now = new Date().getTime();
    if (now > item.expiration) {
        localStorage.removeItem('token');
        return null;
    }

    return item.value;

}


