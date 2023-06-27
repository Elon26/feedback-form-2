"use strict"

const form = document.querySelector(".feedback__form");
const allInputs = form.querySelectorAll(".feedback__input")
const nameInput = form.name;
const phoneInput = form.phone;
const emailInput = form.email;
const messageInput = form.message;

/** Функция выполняет валидацию полей формы. */
function validate(nameValue, phoneValue, emailValue) {
    let isValid = true;
    const regPhone = /\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/;
    const regEmail = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i;

    if (nameValue.trim() === "") {
        handleError("name", "Введите имя");
        isValid = false;
    }

    if (phoneValue.trim() === "") {
        handleError("phone", "Введите номер телефона");
        isValid = false;
    } else {
        if (!regPhone.test(phoneValue)) {
            handleError("phone", "Недопустимый формат номера телефона, приведите к следующей форме: +7 (423) 123-45-67");
            isValid = false;
        }
    }

    if (emailValue.trim() === "") {
        handleError("email", "Введите e-mail");
        isValid = false;
    } else {
        if (!regEmail.test(emailValue)) {
            handleError("email", "Недопустимый формат e-mail, приведите к следующей форме: mail@example.com");
            isValid = false;
        }
    }

    return isValid;
}

/** Функция создаёт сообщение об ошибке, а также меняет цвет границы поля ввода. */
function handleError(inputName, errorMessage) {
    const inputItem = form[inputName];
    inputItem.classList.add("error");

    const errorItem = document.createElement("div");
    errorItem.className = `feedback__error feedback__error_${inputName}`;
    errorItem.textContent = errorMessage;
    inputItem.after(errorItem);
}

/** Функция создаёт пользовательское сообщение. */
function createUserMessage(status, userMessage) {
    removeUserMessage();

    const userMessageItem = document.createElement("div");
    document.body.prepend(userMessageItem);
    userMessageItem.className = `userMessage userMessage_${status}`;
    userMessageItem.textContent = userMessage;

    setTimeout(() => {
        userMessageItem.classList.add("visible")
    }, 0);
    setTimeout(() => {
        userMessageItem.classList.remove("visible")
    }, 3000);
    setTimeout(() => {
        userMessageItem.remove();
    }, 4000);
}

/** Функция форсирует удаление пользовательского сообщения. */
function removeUserMessage() {
    const userMessage = document.querySelector(".userMessage");
    if (userMessage) userMessage.remove();
}

/** Функция удаляет все сообщения об ошибках. */
function removeAllErrors() {
    const errors = document.querySelectorAll(".feedback__error");
    errors.forEach(error => error.remove());
}

/** Функция очищает форму от введённых значений. */
function clearForm() {
    nameInput.value = "";
    phoneInput.value = "";
    emailInput.value = "";
    messageInput.value = "";
}

/** Функция преобразует введённый пользователем номер телефона в формат, пригодный для хранения в базе данных. */
function handlePhoneValue(phoneValue) {
    let result = "+7";

    for (let i = 0; i < phoneValue.length; i++) {
        if (i > 3 && i < 7) {
            result += phoneValue[i];
        }
        if (i > 8 && i < 12) {
            result += phoneValue[i];
        }
        if (i > 12 && i < 15) {
            result += phoneValue[i];
        }
        if (i > 15 && i < 18) {
            result += phoneValue[i];
        }
    };

    return result;
}

/** Данная настройка добавляет и убирает соответсвующий класс, необходимый для цветовой стилизации элемента, для заголовка элемента формы, при добавлении и снятии фокуса на каждом поле ввода формы. */
allInputs.forEach(input => {
    input.addEventListener("focus", () => {
        input.previousElementSibling.classList.add("focus");
    });

    input.addEventListener("blur", () => {
        input.previousElementSibling.classList.remove("focus");
    });
});

/** Данная настройка вводит базовое значение маски ввода при установке фокуса на поле ввода номера телефона. */
phoneInput.addEventListener("focus", () => {
    if (phoneInput.value === "") {
        phoneInput.value = "+7 ("
    }
});

/** Данная настройка убирает базовое значение маски с поля ввода номера телефона при снятии фокуса, если пользователем не было введено значений, отличных от установленных по умолчанию. */
phoneInput.addEventListener("blur", () => {
    if (phoneInput.value.length <= 4) {
        phoneInput.value = ""
    }
});

/** Данная настройка регулирует корректность ввода телефона и добавляет соответствующие спецсимволы маски ввода. */
phoneInput.addEventListener("input", (e) => {
    const reg = /[A-Za-zА-Яа-яЁё`"'!@#$%^&*=_]/g;
    e.target.value = e.target.value.replace(reg, "")
    if (e.target.value.length === 7) {
        e.target.value += ") "
    }
    if (e.target.value.length === 12 || e.target.value.length === 15) {
        e.target.value += "-"
    }
    if (e.target.value.length > 18) {
        e.target.value = e.target.value.slice(0, 18)
    }
});

/** Данная настройка вызывает обработку формы после нажатия кнопки "Отправить". */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameValue = e.target.name.value;
    const phoneValue = e.target.phone.value;
    const emailValue = e.target.email.value;
    const messageValue = e.target.message.value;

    removeAllErrors();
    const isValid = validate(nameValue, phoneValue, emailValue);

    if (isValid) {
        const clearedPhoneValue = handlePhoneValue(phoneValue);
        const objectForSend = {
            name: nameValue,
            phone: clearedPhoneValue,
            email: emailValue,
            message: messageValue
        }

        const response = await fetch("https://jsonplaceholder.typicode.com/posts",
            {
                method: "POST",
                body: JSON.stringify(objectForSend),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            })

        if (response.status < 400) {
            createUserMessage("success", "Форма успешно отправлена");
            clearForm();
        } else {
            if (response.status < 500) {
                createUserMessage("error", "Отправлены некорректные данные");
            } else {
                createUserMessage("error", "Ошибка сервера, повторите запрос позднее");
            }
        }

    } else {
        createUserMessage("error", "Форма не отправлена, пожалуйста, скорректируйте данные");
    }
});

/** Данная удаляет сообщение об ошибке при изменении поля ввода имени. */
nameInput.addEventListener("input", (e) => {
    const errorMessage = document.querySelector(".feedback__error_name");
    if (errorMessage) {
        errorMessage.remove();
        e.target.classList.remove("error");
    }
});

/** Данная удаляет сообщение об ошибке при изменении поля ввода номера телефона. */
phoneInput.addEventListener("input", (e) => {
    const errorMessage = document.querySelector(".feedback__error_phone");
    if (errorMessage) {
        errorMessage.remove();
        e.target.classList.remove("error");
    }
});

/** Данная удаляет сообщение об ошибке при изменении поля ввода email. */
emailInput.addEventListener("input", (e) => {
    const errorMessage = document.querySelector(".feedback__error_email");
    if (errorMessage) {
        errorMessage.remove();
        e.target.classList.remove("error");
    }
});

/** Данная удаляет сообщение об ошибке при изменении поля ввода сообщения. */
messageInput.addEventListener("input", (e) => {
    const errorMessage = document.querySelector(".feedback__error_message");
    if (errorMessage) {
        errorMessage.remove();
        e.target.classList.remove("error");
    }
});
