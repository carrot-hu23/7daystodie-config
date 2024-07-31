import {useController, UseControllerProps, useForm} from "react-hook-form"
import {z, ZodRawShape} from "zod"

import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {zodResolver} from "@hookform/resolvers/zod";
import {GenFormProp, GenInputType} from "@/pages/type.ts";
import {Card, CardContent, CardDescription, CardHeader} from "@/components/ui/card.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Slider} from "@/components/ui/slider.tsx";
import {useEffect, useState} from "react";
import {ArrowBigLeftDash, ArrowBigRightDash} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader, DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";

export default () => {

    const [formSchema, setFormSchema] = useState<z.ZodType<any, any, any>>()

    const form = useForm<z.ZodType<any, any, any>>({
        resolver: zodResolver(formSchema || z.object({})),
        // defaultValues: async () => defaultValues,
    })

    // form.setValue("username","lisi")
    const [serverSettings, setServerSettings] = useState<string>()

    function convertObjectToXml(obj: any): string {
        function buildXmlNode(node: any, indent = ''): string {
            let xmlString = '';
            for (const [key, value] of Object.entries(node)) {
                xmlString += `${indent}<property name="${key}" value="${value}"/>\n`;
            }
            return xmlString;
        }

        return '<?xml version="1.0"?>\n<ServerSettings>\n' + buildXmlNode(obj, '\t') + '</ServerSettings>';
    }


    function onSubmit(values: z.ZodType<any, any, any>) {
        console.log("values", values)
        console.log(convertObjectToXml(values));
    }

    interface SliderInputProps extends UseControllerProps<any> {
        value?: number
        max?: number
        min?: number
        step?: number
        defaultValue?: number
        difficultyType?: string
        showName: string
    }

    const SliderInput: React.FC<SliderInputProps> = ({
                                                         showName,
                                                         name,
                                                         value,
                                                         max,
                                                         min,
                                                         step,
                                                         defaultValue,
                                                         difficultyType,
                                                     }) => {
        const {field} = useController({name, defaultValue: value || 0});

        const [inputValue, setInputValue] = useState<string>(field.value.toString());

        const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            // field.onChange(Number(newValue));
        };

        const onValueChange = (e: number[]) => {
            const newValue = e[0];
            setInputValue(newValue.toString());
            // field.onChange(newValue);
        };

        const setDefaultValue = () => {
            setInputValue(defaultValue + "");
            field.onChange(Number(defaultValue));
        }

        useEffect(() => {
            const handler = setTimeout(() => {
                field.onChange(Number(inputValue));
            }, 100);
            return () => {
                clearTimeout(handler);
            };
        }, [inputValue]);

        const difficultyTypeArrowRenderer = (difficultyType: string | undefined) => {
            switch (difficultyType) {
                case "increasing":
                    return (
                        <div className="flex flex-row mt-1.5 mx-4 w-full">
                            <div className="basis-1/2 flex flex-row space-x-1">
                                <ArrowBigLeftDash color="#31A46C" size={20}/>
                                <span>更简单</span>
                            </div>
                            <div className="basis-1/2 flex flex-row-reverse space-x-1">
                                <ArrowBigRightDash color="#E5474D" size={20}/>
                                <span>更难</span>
                            </div>
                        </div>
                    )
                case "decreasing":
                    return (
                        <div className="flex flex-row mt-1.5 mx-5 w-full">
                            <div className="basis-1/2 flex flex-row space-x-1">
                                <ArrowBigLeftDash color="#E5474D" size={20}/>
                                <span>更难</span>
                            </div>
                            <div className="basis-1/2 flex flex-row-reverse space-x-1">
                                <ArrowBigRightDash color="#31A46C" size={20}/>
                                <span>更简单</span>
                            </div>
                        </div>
                    )
                default:
                    return null;
            }
        }

        return (
            <>
                <div className={'flex'}>
                    <FormLabel className="ml-auto h-8 px-1">{showName}</FormLabel>
                    {difficultyTypeArrowRenderer(difficultyType)}
                    <Button type={'button'} variant="ghost" className="ml-auto h-8 px-1" onClick={() => {
                        setDefaultValue()
                    }}>
                        重置
                    </Button>
                </div>
                <FormControl>
                    <div className="flex">
                        <div className="mx-2 w-[40%] px-0 pr-2">
                            <Input value={inputValue} type="number" onChange={onInputChange}/>
                        </div>
                        <Slider
                            value={[Number(inputValue)]}
                            max={max}
                            min={min}
                            step={step}
                            onValueChange={onValueChange}
                        />
                    </div>
                </FormControl>
            </>
        );
    };


    useEffect(() => {
        const root = window.document.documentElement
        // root.classList.remove("light", "dark")
        root.classList.add("dark")
    }, [])

    const [config, setConfig] = useState<GenFormProp | null>(null)
    const [openedAccordion, setOpenedAccordion] = useState<string>("");

    useEffect(() => {
        async function loadConfig() {
            try {
                const response = await fetch('./config.json');
                const data = await response.json();
                setConfig(data as GenFormProp)
                setOpenedAccordion((data as GenFormProp)?.form[0]?.groupValue)

                const formProp = data as GenFormProp
                const schema: ZodRawShape = {}
                formProp?.form.forEach(item => {
                    item.formList.forEach(item2 => {
                        if (item2.type === "INPUT") {
                            schema[item2.name] = z.string()
                        } else if (item2.type === "INPUT_NUMBER") {
                            schema[item2.name] = z.coerce.number()
                                .min(item2?.min ? item2?.min : Number.MIN_SAFE_INTEGER)
                                .max(item2?.max ? item2?.max : Number.MAX_SAFE_INTEGER)
                        } else if (item2.type === "SLIDER") {
                            schema[item2.name] = z.number()
                        } else if (item2.type === "SELECT") {
                            schema[item2.name] = z.string()
                        } else if (item2.type === "SWITCH") {
                            schema[item2.name] = z.boolean()
                        }
                        // defaultValues[item2.name] = item2.default
                        form.setValue(item2.name as any, item2.default)
                    })
                })
                setFormSchema(z.object(schema))
                setServerSettings(convertObjectToXml(form.getValues()))

                const json = localStorage.getItem("formValue")
                const object = JSON.parse(json || "{}")
                Object.keys(object).map(key => {
                    // @ts-ignore
                    form.setValue(key, object[key])
                })

            } catch (error) {
                console.error('Error loading config.json:', error);
            }
        }

        loadConfig();
    }, []);

    useEffect(() => {

    }, [])

    return (
        <Dialog>
            <main style={{
                background: 'url(https://cdnimg-v2.gamekee.com/wiki2.0/images/w_2560/h_1686/50311/458106/2023/11/15/512091.jpg) 50% 0px / cover no-repeat fixed'
            }} className={'flex flex-col items-center min-h-screen bg-gray-100 dark:bg-black p-4'}>
                <Card className={'w-full max-w-7xl dark:border-none mt-2 dark:rounded-lg dark:bg-neutral-900'}>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            onChange={() => {

                            }}
                        >
                            <CardHeader className={'w-full sticky top-0 z-10 dark:bg-neutral-900 rounded-lg'}>
                                <div>
                                    <div className={'flex justify-between'}>
                                        <div>
                                            <img
                                                src={'https://cdnimg-v2.gamekee.com/wiki2.0/images/w_1024/h_439/50311/458106/2023/11/15/216080.png?x-image-process=image/resize,m_lfit,h_200,w_200&image_process=resize,mid,w_200,h_200'}/>
                                        </div>
                                        <div>
                                            <DialogTrigger asChild>
                                                <Button type="submit" onClick={() => {
                                                    try {
                                                        const validatedData = formSchema?.parse(form.getValues());
                                                        localStorage.setItem("formValue", JSON.stringify(form.getValues()))
                                                        setServerSettings(convertObjectToXml(form.getValues()))
                                                        console.log(validatedData)
                                                    } catch (error) {
                                                        console.log("error", error)
                                                    }
                                                }}>提交</Button>
                                            </DialogTrigger>
                                        </div>
                                    </div>
                                </div>
                                <CardDescription>
                                    {config?.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4">
                                <Tabs value={openedAccordion} onValueChange={(v) => setOpenedAccordion(v)}>
                                    <TabsList className="w-full">
                                        {config?.form?.map(item => (
                                            <TabsTrigger key={item.groupValue} value={item.groupValue}
                                                         className={`w-full`}>{item.groupName}</TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {config?.form?.map(item => (
                                        <TabsContent key={item.groupValue} value={item.groupValue}
                                                     className="space-y-2">
                                            <div className={'mb-4'}>{item.description}</div>
                                            {item.formList.map(item => {
                                                if (item.type === GenInputType.INPUT_NUMBER) {
                                                    return (
                                                        <FormField
                                                            key={item.name}
                                                            control={form.control}
                                                            name={item.name as any}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>{item.showName}</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            type={'number'}
                                                                            placeholder={item.placeholder} {...field} />
                                                                    </FormControl>
                                                                    {item.description && (
                                                                        <FormDescription
                                                                            style={{wordWrap: 'break-word'}}>
                                                                            {item.description}
                                                                        </FormDescription>
                                                                    )}
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                if (item.type === GenInputType.INPUT) {
                                                    return (
                                                        <FormField
                                                            key={item.name}
                                                            control={form.control}
                                                            name={item.name as any}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>{item.showName}</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder={item.placeholder} {...field} />
                                                                    </FormControl>
                                                                    {item.description && (
                                                                        <FormDescription
                                                                            style={{wordWrap: 'break-word'}}>
                                                                            {item.description}
                                                                        </FormDescription>
                                                                    )}
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                if (item.type === GenInputType.TEXTAREA) {
                                                    return (
                                                        <FormField
                                                            key={item.name}
                                                            control={form.control}
                                                            name={item.name as any}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>{item.showName}</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            placeholder={item.placeholder} {...field} />
                                                                    </FormControl>
                                                                    {item.description && (
                                                                        <FormDescription
                                                                            style={{wordWrap: 'break-word'}}>
                                                                            {item.description}
                                                                        </FormDescription>
                                                                    )}
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                if (item.type === GenInputType.SWITCH) {
                                                    return (
                                                        <FormField
                                                            key={item.name}
                                                            control={form.control}
                                                            name={item.name as any}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <div
                                                                        className="flex flex-row items-center justify-between ">
                                                                        <FormLabel>{item.showName}</FormLabel>
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                    </div>
                                                                    {item.description && (
                                                                        <FormDescription
                                                                            style={{wordWrap: 'break-word'}}>
                                                                            {item.description}
                                                                        </FormDescription>
                                                                    )}
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                if (item.type === GenInputType.SELECT) {
                                                    return (
                                                        <FormField
                                                            key={item.name}
                                                            control={form.control}
                                                            name={item.name as any}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <div
                                                                        className="flex flex-row items-center justify-between ">
                                                                        <FormLabel className="text-base">
                                                                            {item.showName}
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Select onValueChange={field.onChange}
                                                                                    defaultValue={field.value}>
                                                                                <SelectTrigger className="w-[180px]">
                                                                                    <SelectValue
                                                                                        placeholder={item.placeholder}/>
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {item.options?.map(option => (
                                                                                        <SelectItem key={option.name}
                                                                                                    value={option.name}>{option.label}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormControl>
                                                                    </div>
                                                                    {item.description && (
                                                                        <FormDescription
                                                                            style={{wordWrap: 'break-word'}}>
                                                                            {item.description}
                                                                        </FormDescription>
                                                                    )}
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                if (item.type === GenInputType.SLIDER) {
                                                    return (
                                                        <FormField
                                                            key={item.name}
                                                            control={form.control}
                                                            name={item.name as any}
                                                            render={() => (
                                                                <FormItem>
                                                                    <SliderInput showName={item.showName}
                                                                                 name={item.name}
                                                                                 max={item.max} min={item.min}
                                                                                 defaultValue={item.default}
                                                                                 step={item.step}
                                                                                 difficultyType={"increasing"}
                                                                    />
                                                                    {item.description && (
                                                                        <FormDescription
                                                                            style={{wordWrap: 'break-word'}}>
                                                                            {item.description}
                                                                        </FormDescription>
                                                                    )}
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                return (<div key={item.name}/>)
                                            })}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </form>
                    </Form>
                </Card>


                <DialogContent className={'dark:text-slate-400  max-w-4xl dark:border-none  dark:bg-neutral-900'}>
                    <DialogHeader>
                        <DialogTitle>配置文件</DialogTitle>
                        <DialogDescription>
                            serverconfig.xml
                        </DialogDescription>
                    </DialogHeader>
                    <div className={'max-h-80 overflow-y-auto dark:caret-blue-50 '}>
                        {serverSettings}
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>

            </main>
        </Dialog>
    )
}
