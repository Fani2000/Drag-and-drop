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
    this.descriptionInputElement = this.element.querySelector("description")!;
    this.peopleInputElement = this.element.querySelector("people")!;

    this.configure();
    this.attach();
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const app = new ProjectInput();
