"use strict";
// Validation
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const validate = (validatableInput) => {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength !== undefined && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength !== undefined && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min !== undefined && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max !== undefined && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
};
// autobind decorator
function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            console.log();
            return boundFn;
        }
    };
    return adjDescriptor;
}
// Project Type
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Date.now().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenFn of this.listeners) {
            listenFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
// ProjectList Class
class ProjectList {
    constructor(projectType) {
        this.projectType = projectType;
        this.templateElement = document.querySelector('#project-list');
        this.hostElement = document.querySelector('#app');
        this.assignedProjects = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.projectType}-projects`;
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => {
                if (this.projectType === 'active') {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    addProject() {
    }
    renderProjects() {
        const list = document.querySelector(`#${this.projectType}-projects-list`);
        list.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            list.appendChild(listItem);
        }
    }
    renderContent() {
        const listId = `${this.projectType}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = `${this.projectType.toUpperCase()} PROJECTS`;
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
// ProjectInput Class
class ProjectInput {
    constructor() {
        this.templateElement = document.querySelector('#project-input');
        this.hostElement = document.querySelector('#app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    getUserIput() {
        const enteredTitle = this.titleInputElement.value.trim();
        const enteredDescription = this.descriptionInputElement.value.trim();
        const enteredPeople = this.peopleInputElement.value.trim();
        const validatableTitle = {
            value: enteredTitle,
            required: true
        };
        const validatableDescription = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const validatablePeople = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10
        };
        if (!validate(validatableTitle) ||
            !validate(validatableDescription) ||
            !validate(validatablePeople)) {
            alert('Invalid input!');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.getUserIput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
    clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
const appInput = new ProjectInput();
const appActiveList = new ProjectList('active');
const appFinishedList = new ProjectList('finished');
//# sourceMappingURL=app.js.map