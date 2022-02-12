// Validation

interface Validatable {
  value: string | number
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

const validate = (validatableInput: Validatable) => {
  let isValid = true
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }

  if (validatableInput.minLength !== undefined && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }

  if (validatableInput.maxLength !== undefined && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }

  if (validatableInput.min !== undefined && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }

  if (validatableInput.max !== undefined && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }

  return isValid
}

// autobind decorator
function Autobind (_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get () {
      const boundFn = originalMethod.bind(this)
      return boundFn
    }
  }

  return adjDescriptor
}

// Project Type


enum ProjectStatus {
  Active, Finished
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus) {

  }
}
// Project State Maganement Class
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []

  addListener (listenerFn: Listener<T>) {
    this.listeners.push(listenerFn)
  }
}


class ProjectState extends State<Project> {
  private projects: Project[] = []
  private static instance: ProjectState

  private constructor() {
    super()
  }

  static getInstance () {
    if (this.instance) {
      return this.instance
    }

    this.instance = new ProjectState()
    return this.instance
  }



  addProject (title: string, description: string, numOfPeople: number) {
    const newProject = new Project(Date.now().toString(), title, description, numOfPeople, ProjectStatus.Active)
    this.projects.push(newProject)

    for (const listenFn of this.listeners) {
      listenFn(this.projects.slice())
    }
  }
}

const projectState = ProjectState.getInstance()

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement
  hostElement: T
  element: U

  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = <HTMLTemplateElement>document.querySelector(`#${templateId}`)
    this.hostElement = <T>document.querySelector(`#${hostElementId}`)


    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = <U>importedNode.firstElementChild
    if (newElementId) {
      this.element.id = newElementId
    }

    this.attach(insertAtStart)
  }

  private attach (insertStart: boolean) {
    this.hostElement.insertAdjacentElement(insertStart ? 'afterbegin' : 'beforeend', this.element)
  }

  abstract configure (): void
  abstract renderContent (): void
}


// ProjectList Class

class ProjectList extends Component<HTMLElement, HTMLDivElement> {
  assignedProjects: Project[]

  constructor(private projectType: 'active' | 'finished') {
    super('project-list', 'app', false, `${projectType}-projects`)
    this.assignedProjects = []



    this.configure()
    this.renderContent()
  }

  configure (): void {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.projectType === 'active') {
          return project.status === ProjectStatus.Active
        }

        return project.status === ProjectStatus.Finished
      })

      this.assignedProjects = relevantProjects
      this.renderProjects()
    })
  }

  renderContent () {
    const listId = `${this.projectType}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = `${this.projectType.toUpperCase()} PROJECTS`
  }

  private renderProjects () {
    const list = <HTMLUListElement>document.querySelector(`#${this.projectType}-projects-list`)
    list.innerHTML = '';
    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement('li')
      listItem.textContent = projectItem.title
      list.appendChild(listItem)
    }
  }

}


// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    super('project-input', 'app', true, 'user-input')

    this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
    this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
    this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')


    this.configure()
  }

  configure () {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private getUserIput (): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value.trim()
    const enteredDescription = this.descriptionInputElement.value.trim()
    const enteredPeople = this.peopleInputElement.value.trim()

    const validatableTitle: Validatable = {
      value: enteredTitle,
      required: true
    }

    const validatableDescription: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    }

    const validatablePeople: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10
    }

    if (
      !validate(validatableTitle) ||
      !validate(validatableDescription) ||
      !validate(validatablePeople)
    ) {
      alert('Invalid input!')
      return
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople]
    }
  }

  @Autobind
  private submitHandler (event: Event) {
    event.preventDefault()
    const userInput = this.getUserIput()

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput
      projectState.addProject(title, description, people)
      this.clearInputs()
    }
  }

  private clearInputs () {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }



  renderContent (): void { }

}

const appInput = new ProjectInput()
const appActiveList = new ProjectList('active')
const appFinishedList = new ProjectList('finished')