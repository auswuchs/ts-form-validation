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
      console.log();

      return boundFn
    }
  }

  return adjDescriptor
}

// 
class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLFormElement

  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    this.templateElement = <HTMLTemplateElement>document.querySelector('#project-input')
    this.hostElement = <HTMLDivElement>document.querySelector('#app')

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = <HTMLFormElement>importedNode.firstElementChild
    this.element.id = 'user-input'

    this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
    this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
    this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')

    this.configure()
    this.attach()
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
      console.log(title, description, people);
      this.clearInputs()
    }
  }

  private clearInputs () {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  private configure () {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private attach () {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const appInput = new ProjectInput()