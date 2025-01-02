"use strict";

import Keyboard from "simple-keyboard";
import "./index.css";
import germanLayout from "simple-keyboard-layouts/build/layouts/german";
import englishLayout from "simple-keyboard-layouts/build/layouts/english";

const numericLayout = {
    default: ["1 2 3", "4 5 6", "7 8 9", "{tab} 0 {bksp} {downkeyboard}"],
};

const querySelector = "input:not([readonly]), textarea:not([readonly])";
let keyboard: Keyboard;
let keyboardElement: HTMLDivElement;
let togglerButton: HTMLDivElement;
let inputElement: HTMLInputElement;
let keyboardHideTask: unknown = null;
let languageLayout = englishLayout;
let shiftPressed = false;
let isMouseDown = false;

function setup(): void {
    chrome.storage.sync.get(
        {
            language: "english",
        },
        function (items) {
            switch (items.language) {
                case "german":
                    languageLayout = germanLayout;
                    break;
                default:
                    languageLayout = englishLayout;
            }
            const keyRowsDefault = languageLayout.layout.default;
            keyRowsDefault[keyRowsDefault.length - 1] += " {downkeyboard}";
            const keyRowsShift = languageLayout.layout.shift;
            keyRowsShift[keyRowsShift.length - 1] += " {downkeyboard}";
            if (!!keyboard) {
                toggleShiftLayout();
                toggleShiftLayout();
            }
        }
    );

    let styleElement = document.createElement("link");
    styleElement.rel = "stylesheet";
    styleElement.href = chrome.runtime.getURL("index.css");
    document.head.appendChild(styleElement);

    keyboardElement = document.createElement("div");
    keyboardElement.id = "virtual-keyboard";
    keyboardElement.onmousedown = (e) => e.preventDefault();
    keyboardElement.ontouchstart = (e) => e.preventDefault();
    document.body.append(keyboardElement);
    let keyboardWrapper = document.createElement("div");
    keyboardWrapper.className = "keyboard-wrapper simple-keyboard";
    keyboardElement.append(keyboardWrapper);

    togglerButton = document.createElement("div");
    togglerButton.id = "keyboard-toggler";
    togglerButton.className = "hidden";
    togglerButton.onmousedown = (e) => e.preventDefault();
    togglerButton.ontouchstart = (e) => e.preventDefault();
    togglerButton.onclick = (e) => toggleKeyboard();
    document.body.append(togglerButton);
    document.body.addEventListener("mousedown", (e) => (isMouseDown = true));
    document.body.addEventListener("mouseup", (e) => onMouseUp());

    [
        "input",
        "pointerdown",
        "mousedown",
        "pointerup",
        "mouseup",
        "selectstart",
        "click",
    ].forEach((key) => {
        window.addEventListener(
            key,
            (event) => {
                if (isChildElement(event.target, keyboardElement)) {
                    event.preventDefault();
                }
            },
            true
        );
    });

    keyboard = new Keyboard({
        onKeyPress: (button) => onKeyPress(button),
        onKeyReleased: (button) => onKeyRelease(button),
        ...languageLayout,
        display: {
            "{tab}": "↹",
            "{bksp}": "⌫",
            "{downkeyboard}": "\u25BC",
            "{space}": " ",
            "{lock}": "⇪",
            "{shift}": "⇧",
            "{enter}": "↵",
        },
    });
    setInterval(() => {
        checkKeyboard();
    }, 200);
    hideKeyboard();
}

function isChildElement(child: EventTarget | null, target: HTMLElement): boolean {
    if (target === child) {
        return true;
    }
    if (child && (child as HTMLElement).parentElement) {
        return isChildElement((child as HTMLElement).parentElement, target);
    }
    return false;
}

function onKeyRelease(button: string): void {
    switch (button) {
        case "{downkeyboard}":
            onFocusOut();
            break;
    }
}

function onMouseUp(): void {
    isMouseDown = false;
    if (inputElement) {
        return;
    }
    hideKeyboard();
    hideKeyboardToggler();
}

function onKeyPress(button: string): void {
    if (!inputElement || !button) {
        return;
    }
    let pos = inputElement.selectionStart;
    let posEnd = inputElement.selectionEnd;
    if (
        inputElement.type.toLowerCase() === "number" &&
        button !== "{tab}" &&
        button !== "{downkeyboard}"
    ) {
        onKeyPressNumeric(button);
        return;
    }

    switch (button) {
        case "{shift}":
            handleShiftPress();
            break;
        case "{lock}":
            handleCapsLockPressed();
            break;
        case "{enter}":
            if (inputElement.tagName.toLowerCase() === "textarea") {
                button = "\n";
                if (pos !== null) {
                    inputElement.value =
                        inputElement.value.substring(0, pos ?? 0) +
                        button +
                        inputElement.value.substring(posEnd ?? 0);
                    inputElement.selectionStart = pos + 1;
                    inputElement.selectionEnd = pos + 1;
                } else {
                    inputElement.value = inputElement.value + button;
                }
            } else {
                performNativeKeyPress(inputElement, 13);
            }
            break;
        case "{bksp}":
            if (pos === null) {
                inputElement.value = String(inputElement.value).substr(
                    0,
                    inputElement.value.length - 1
                );
                performNativeKeyPress(inputElement, 8);
                break;
            }

            if (posEnd === 0) {
                performNativeKeyPress(inputElement, 8);
                break;
            }
            if (posEnd === pos) {
                pos = pos - 1;
            }
            inputElement.value =
                String(inputElement.value).substring(0, pos) +
                String(inputElement.value).substring(posEnd ?? 0);
            inputElement.selectionStart = pos;
            inputElement.selectionEnd = pos;
            performNativeKeyPress(inputElement, 8);
            break;
        case "{tab}":
            let inputList = Array.from(document.querySelectorAll(querySelector));
            let index = inputList.indexOf(inputElement);
            (inputList[(index + 1) % inputList.length] as HTMLInputElement).focus();
            break;
        case "{downkeyboard}":
            break;
        case "{space}":
            button = " ";
        default:
            for (let char of button) {
                if (pos === null) {
                    inputElement.value = inputElement.value + char;
                } else {
                    inputElement.value =
                        inputElement.value.substring(0, pos) +
                        char +
                        inputElement.value.substring(posEnd ?? 0);
                    inputElement.selectionStart = pos + 1;
                    inputElement.selectionEnd = pos + 1;
                    pos = inputElement.selectionStart;
                    posEnd = inputElement.selectionEnd;
                }
                performNativeKeyPress(inputElement, String(char).charCodeAt(0));
            }
            break;
    }

    if (button !== "{shift}") {
        disableShiftPress();
    }
}

function onKeyPressNumeric(button: string): void {
    if (
        ![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "{bksp}"].some(
            (x) => String(x) === button
        )
    ) {
        return;
    }
    if (button === "{bksp}") {
        const strValue = String(inputElement.value);
        if (strValue.length > 0) {
            inputElement.value = strValue.substring(0, strValue.length - 1);
        }
    } else {
        inputElement.value = String(inputElement.value) + button;
    }
    performNativeKeyPress(inputElement, String(button).charCodeAt(0));
}

function performNativeKeyPress(element: HTMLInputElement, keyCode: number): void {
    element.dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: keyCode, which: keyCode })
    );
    element.dispatchEvent(
        new KeyboardEvent("keypress", { keyCode: keyCode, which: keyCode })
    );
    element.dispatchEvent(new Event("input", { bubbles: true }));
}

function onFocus(target: HTMLInputElement): void {
    inputElement = target;
    if (target.type.toLowerCase() === "number") {
        keyboard.setOptions({
            layout: numericLayout,
            layoutName: "default",
        });
    } else {
        keyboard.setOptions({
            ...languageLayout,
            layoutName: "default",
        });
    }

    if (inputElement.matches(".no-keyboard")) {
        showKeyboardToggler();
        return;
    }

    hideKeyboardToggler();
    showKeyboard();
    const offset = 50;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = inputElement.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
}

function showKeyboardToggler(): void {
    togglerButton.classList.remove("hidden");
}

function hideKeyboardToggler(): void {
    togglerButton.classList.add("hidden");
}

function toggleKeyboard(): void {
    if (keyboardElement.style.display === "none") {
        showKeyboard();
    } else {
        hideKeyboard();
    }
}

function onFocusOut(): void {
    if (inputElement) {
        inputElement.blur();
        inputElement = null as any;
    }
    hideKeyboard();
    hideKeyboardToggler();
}

function showKeyboard(): void {
    const dialogs = document.querySelectorAll(".fixed-full");
    if (keyboardHideTask != null) {
        clearTimeout(keyboardHideTask as number);
        keyboardHideTask = null;
    }
    keyboardElement.removeAttribute("style");
    document.body.removeAttribute("style");
    for (let fixed of dialogs) {
        (fixed as HTMLElement).removeAttribute("style");
    }
}

function checkKeyboard(): void {
    if (isMouseDown) {
        return;
    }
    if (document.activeElement && document.activeElement.matches(querySelector)) {
        if (inputElement === document.activeElement) {
            return;
        }
        onFocus(document.activeElement as HTMLInputElement);
    } else {
        if (inputElement === null) {
            return;
        }
        onFocusOut();
    }
}

function hideKeyboard(): void {
    keyboardHideTask = setTimeout(() => {
        const dialogs = document.querySelectorAll(".fixed-full");
        keyboardElement.style.display = "none";
        document.body.removeAttribute("style");
        keyboardHideTask = null;
        for (const fixed of dialogs) {
            (fixed as HTMLElement).removeAttribute("style");
        }
    });
}

function handleShiftPress(): void {
    shiftPressed = !shiftPressed;
    toggleShiftLayout();
}

function handleCapsLockPressed(): void {
    toggleShiftLayout();
}

function disableShiftPress(): void {
    if (!shiftPressed) {
        return;
    }
    shiftPressed = false;
    toggleShiftLayout();
}

function toggleShiftLayout(): void {
    let currentLayout = keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    keyboard.setOptions({
        layoutName: shiftToggle,
    });
}

setup();
