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
  // console.log(descriptor)
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

// Drag and Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
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
    status: ProjectStatus
  ) {
    const project = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      status
    );
    // console.log(newProject);
    this.projects.push(project);

    this.updateListeners();
    // for (const listenerFn of this.listeners) {
    //   listenerFn(this.projects.slice());
    // }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
}

const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  // prettier-ignore
  constructor(templateId: string, hostElementId: string,  insertAtStart: boolean, newElementId?: string) {
    // prettier-ignore
    this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)
    this.hostElement = <T>document.getElementById(hostElementId);
    // prettier-ignore
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <U>importedNode.firstElementChild;
    this.element.id = newElementId ?? ""

    this.attach(insertAtStart)
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
  abstract configure(): void;
  abstract renderContent(): void;
}

// prettier-ignore
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
  private project: Project;

  get persons() {
    return this.project.people === 1
      ? "1 Person"
      : `${this.project.people} Persons`;
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    // console.log(hostId, project, this.element);
    this.project = project;
    this.renderContent();
    this.configure();
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    // console.log(event)
    event.dataTransfer!.setData('text/plain', this.project.id)
    event.dataTransfer!.effectAllowed = 'move'
  }

  @AutoBind
  dragEndHandler(event: DragEvent): void {
    console.log('Drag End')
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }
  renderContent(): void {
    console.log(this.project);
    this.element.querySelector("h2")!.textContent = this.project.title;
    // prettier-ignore
    this.element.querySelector("h3")!.textContent = this.persons + ' assigned';
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// prettier-ignore
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
  assignedProjects: any[] = [];
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
      event.preventDefault()
      const listEl = this.element.querySelector('ul')!
      listEl.classList.add('droppable')
    }
  }

  @AutoBind
  dropHandler(event: DragEvent): void {
    const projId = event.dataTransfer!.getData('text/plain')
    projectState.moveProject(projId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
  }

  @AutoBind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector('ul')!
    listEl.classList.remove('droppable')

  }

  private renderProjects() {
    // prettier-ignore
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const projItem of this.assignedProjects) {
      // console.log(projItem);
      new ProjectItem(this.element.querySelector("ul")!.id, projItem);
      // const listItem = document.createElement("li");
      // listItem.textContent = projItem.title;
      // listEl.appendChild(listItem);
    }
  }

  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
    this.element.addEventListener('drop', this.dropHandler)

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      // console.log(relevantProjects);
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector("#title")!;
    this.descriptionInputElement = this.element.querySelector("#description")!;
    this.peopleInputElement = this.element.querySelector("#people")!;

    this.configure();
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
      projectState.addProject(
        title,
        desc,
        Number(people),
        ProjectStatus.Active
      );
    }
    this.clearInputs();
  }

  renderContent(): void {}

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const app = new ProjectInput();
const activeProjectList = new ProjectList("active");
const FinishedProjectList = new ProjectList("finished");
