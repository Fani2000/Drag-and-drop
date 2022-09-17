// function Logger(constructor: Function) {
//   console.log("LOGGING...");
//   console.log(constructor);
// }

// function Required(target: any, propertyName: string) {
//   console.log("Required", target);
//   console.log("Required", propertyName);
// }

// // prettier-ignore
// function checkName(target: any, methodName: string, descriptor: PropertyDescriptor) {
//   console.log("CheckName", target)
//   console.log("CheckName", methodName)
//   console.log("CheckName" ,descriptor)
// }

// @Logger
// class Person {
//   @Required
//   name = "Fani";

//   constructor() {
//     console.log("Creating person object...");
//   }

//   @checkName
//   showName() {
//     console.log("Your name is " + this.name);
//   }
// }

// const pers = new Person();
// console.log(pers);
// console.log("hello");

// console.log("Hello");

/**
 * @params (any) target, (string) methodName, (PropertyDescriptor) descriptor
 */
// prettier-ignore
function AutoBind(target: any, methodName: string, descriptor: PropertyDescriptor){
  console.log(descriptor)
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this)
      return boundFn
    }
  }
   return adjDescriptor
}

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable): boolean => {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  // prettier-ignore
  if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
    isValid = isValid && validatableInput.value.trim().length > validatableInput.minLength
  }

  // prettier-ignore
  if(validatableInput.maxLength!= null && typeof validatableInput.value === 'string'){
    isValid = isValid && validatableInput.value.trim().length < validatableInput.maxLength
  }

  // prettier-ignore
  if(validatableInput.min!= null && typeof validatableInput.value === 'number'){
    isValid = isValid && validatableInput.value > validatableInput.min
  }

  // prettier-ignore
  if(validatableInput.max!= null && typeof validatableInput.value === 'number'){
    isValid = isValid && validatableInput.value < validatableInput.max
  }

  return isValid;
};

enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

// Project State management class - uses singleton project to manage state
class ProjectState {
  private projects: any[] = [];
  private static instance: ProjectState;
  private listeners: any[] = [];

  private constructor() {}

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(
    title: string,
    description: string,
    numOfPeople: number,
    status: string
  ) {
    const newProject = {
      id: Math.random().toString(),
      title,
      description,
      people: numOfPeople,
      status,
    };
    // console.log(newProject);
    this.projects.push(newProject);

    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[] = [];
  constructor(private type: "active" | "finished") {
    // prettier-ignore
    this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // prettier-ignore
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <HTMLElement>importedNode.firstElementChild;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      console.log(projects);
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.renderContent();
    this.attach();
  }

  private renderProjects() {
    // prettier-ignore
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const projItem of this.assignedProjects) {
      console.log(projItem);
      const listItem = document.createElement("li");
      listItem.textContent = projItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // prettier-ignore
    this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // prettier-ignore
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <HTMLFormElement>importedNode.firstElementChild;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector("#title")!;
    this.descriptionInputElement = this.element.querySelector("#description")!;
    this.peopleInputElement = this.element.querySelector("#people")!;

    this.configure();
    this.attach();
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private getUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // prettier-ignore
    // if(enteredTitle.trim().length === 0 || enteredDescription.trim().length === 0 || enteredPeople.trim().length === 0){
    if(!validate({value: enteredTitle, required: true}) || !validate({value: enteredDescription,required: true,minLength: 5}) || !validate({value: Number(enteredPeople), required: true, min: 1, max: 5})){
      alert('Invalid Input, please try again!')
      return;
    }

    return [enteredTitle, enteredDescription, Number(enteredPeople)];
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      // console.log(title, desc, people);
      projectState.addProject(title, desc, people, "active");
    }
    this.clearInputs();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const app = new ProjectInput();
const activeProjectList = new ProjectList("active");
const FinishedProjectList = new ProjectList("finished");
