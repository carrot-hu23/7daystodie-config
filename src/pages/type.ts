export enum GenInputType {
    INPUT = "INPUT",
    SELECT = "SELECT",
    SLIDER = "SLIDER",
    SWITCH = "SWITCH",
    TEXTAREA = "TEXTAREA",
    INPUT_NUMBER = "INPUT_NUMBER",
}

interface optionProp {
    name: string,
    label: string,
}

export interface GenFormProp {
    title: string,
    description?: string,
    form: GenFormGroupProp[]
}

export interface GenFormGroupProp {
    groupName: string,
    groupValue: string,
    description?: string,
    formList: GenInputProp[]
}

export interface GenInputProp {
    name: string,
    showName: string,
    placeholder?: string,
    description?: string,
    type: GenInputType,
    defaultValue?: any,
    options?: optionProp[],
    max?: number,
    min?: number,
    step?: number,
    default?: any
}