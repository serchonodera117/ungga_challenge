"use client"
// libraries
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useChat } from 'ai/react';
import { useParams } from 'next/navigation';
import axios from 'axios';
// store and context
import useMessagesStore from '@/store/useMessagesStore';
import useConversationsStore from '@/store/useConversationsStore';
// utils
import { PROMPTS } from '../../utils/propts';
import { nanoid } from 'nanoid';
import { Message } from 'ai';
import { Result } from 'postcss';
import { Interface } from 'readline';
import { json } from 'stream/consumers';
import OpenAI from "openai";


const useChatCustom = () => {
	// const db = require('app/api/chat/db')
	// const query = require('app/api/chat/queries')

	const params = useParams();
	const [openAIToken, setOpenAIToken] = useState <String | ''>();
	const [dateInput, setDateInput] = useState<Date | undefined>();
	const userId = useRef(nanoid());
	const [listOfComponents, setListOfComponents] = useState<any[]>([]);
	
	const [
		setNewMessage,
		setNewMessageComponent,
		messagesComponents,
		messages,
		setMessages,
		setMessagesComponents
	] = useMessagesStore((state) => [
		state.setNewMessage,
		state.setNewMessageComponent,
		state.messagesComponents,
		state.messages,
		state.setMessages,
		state.setMessagesComponents
	]);
	const conversationList = useConversationsStore((state) => state.conversationList);
	const [inputMessage, setInputMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		getMessages(1)
		setOpenAIToken("")
		setInputMessage('');
		ask_or_set_openaiToken()
	},[])

	const handleChangeMessage = (e: any) => {
		setInputMessage(e.target.value);
	};
	//----------------------------------------------------------- set or ask for open ai api token
	function ask_or_set_openaiToken(){
		let token: any = localStorage.getItem('openai_token');
		if(token!==null && token.trim('')) {
			setOpenAIToken(token.toString());
		}
		else{
			let writedToken: any = prompt("paste here your open AI token to work with the assistant");
			let message: string = (writedToken!=null && writedToken.trim(''))? "saved token" : "warning you have to set the openAI token, don't leave it blank"
			let require_reload: boolean = (writedToken!=null && writedToken.trim(''))? false : true;
			alert(message);
			
			if(require_reload){location.reload();}
			else{
				localStorage.setItem('openai_token', writedToken);
				setOpenAIToken(writedToken);
			}
		}
	}

	async function getMessages(userId: Number){
		const response: any = await axios.get(`http://localhost:3001/receive_messages/${userId}`)
		const resp: any = await  response.data;

		resp.map((message: any) =>{
			setNewMessage({
				content: message.message,
				id: nanoid(),
				role: (message.username == "gpt")? "assistant": "user"
			});
		})
	}
	
																				//------------------------------------------- send to open ai api
	const sendMessage = useCallback(async (newMessage: string) => {
		setInputMessage('');
		try {
			let url: string = "https://api.openai.com/v1/chat/completions"
			
			let openAIOBJ: any = {
				"model": "gpt-3.5-turbo",
				"messages": [
								{
									 "role": "system",
									 "content": "You are a helpful real estate assistant."
								},
								{
									"role": "user",
									"content": newMessage
								}
							],
				}; 

				const response = await axios.post(url, openAIOBJ, {
					headers: {
						"Content-Type":  "application/json",
						 "Authorization": `Bearer ${openAIToken}`
						}
				});

				const messageReceived: string = response.data.choices[0].message.content; 
				console.log("Gpt response: ", messageReceived) 
			
				setNewMessage({
				content: messageReceived, //response.data,
				id: nanoid(),
				role: 'assistant'
			});

			localSave(
				{
					message: messageReceived,
					userId: 1,
					username: 'gpt'
				}
			)
		} catch (error) {
			console.error(error);
		}
	}, []);

																					//-------------------------------------------------- send to my local api to save messages
	async function localSave (data: object){
		console.log(`sended message: ${JSON.stringify(data)}`)
		const response: any = await axios.post('http://localhost:3001/send_message', data)
		const resp: any = await  JSON.stringify(response);
		console.log("local saved token: ", openAIToken);
	}
	// Current chat input component name
	const inputType = useMemo(
		() =>
			messagesComponents?.length && messagesComponents?.at(-1)?.output
				? messagesComponents?.at(-1)?.output.input_component ?? 'text_input'
				: messagesComponents?.at(-1)?.content?.output
				? messagesComponents?.at(-1)?.content?.output?.input_component ?? 'text_input'
				: 'text_input',
		[messagesComponents]
	);

	// Handle date input
	const handleDateInputChange = (newValue: Date) => {
		setDateInput(newValue);
	};

	// Submit user message
	const handleSubmitCustom = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let id = nanoid();
		if (!e) return;
		setNewMessage({
			content: inputMessage,
			id: id,
			role: 'user'
		});
		
		sendMessage(inputMessage); //------------------------------------ message insersion
		
		localSave({
			message: inputMessage,
			userId: 1,
			username: 'user'
		})
	};

	// Get one conversation
	const getConversation = useCallback(async () => {
		if (!params.id) return;

		try {
			const { data } = await axios.get(`/api/conversation/${params.id}`);

			let resultMessages: Message[] = [];
			Object.values((data as Conversation).mapping).forEach(
				(item: MessageModule, index: number, array: MessageModule[]) => {
					if (
						!item.message ||
						item.message?.author.role === 'system' ||
						item.message?.author.role === 'tool'
					) {
						return;
					}

					// it always has one element
					const part = item.message?.content.parts[0];
					if (
						item.message.recipient !== 'all' &&
						array[index + 1]?.message?.author.role === 'tool'
					) {
						// TOOL (PLUGINS) MESSAGE
						const nextItem = array[index + 1];
						const partTool = nextItem?.message?.content.parts[0];

						const payload = {
							id: item.id,
							createdAt: item.message.create_time ?? new Date(),
							content: partTool,
							role: 'function',
							name: nextItem.message?.author.name,
							function_call: part
							// string | ChatCompletionMessage.FunctionCall	undefined;
						};
						resultMessages.push(payload as Message);
					} else {
						// MARKDOWN AND TEXT MESSAGES
						const payload = {
							id: item.id,
							createdAt: item.message.create_time ?? new Date(),
							content: part,
							role: item.message.author.role
						};
						resultMessages.push(payload as Message);
					}
				}
			);
			setMessages(resultMessages);
			data && formatOutput(data);
		} catch (err) {
			console.error({ err });
		}
	}, [conversationList]);

	// Format message for render
	const formatOutput = useCallback((conversation: Conversation) => {
		const result: any[] = [];
		Object.values(conversation.mapping).filter((item) => {
			if (item.message && item.message?.author.role !== 'system') {
				const part = item.message?.content.parts[0];
				const outputPart = {
					createdAt: item.message.create_time,
					id: item.id,
					role: item.message.author.role,
					content: {
						output: {
							message: {
								content: part,
								component: undefined
							},
							input_component: 'text_input'
						}
					}
				};
				result.push(outputPart);
			}
		});
		setMessagesComponents(result);
	}, []);

	// Save initial message
	// useEffect(() => {
	// 	if (messages.length === 0) {
	// 		setNewMessage({
	// 			content: PROMPTS.initial,
	// 			id: 'initial',
	// 			role: 'system'
	// 		});
	// 	}
	// }, []);

	return {
		handleInputChange: handleChangeMessage,
		handleSubmit: handleSubmitCustom,
		input: inputMessage,
		listOfComponents,
		dateInput,
		handleDateInputChange,
		inputType,
		isLoading,
		formatOutput,
		getConversation
	};
};

export default useChatCustom;
