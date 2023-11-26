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


const useChatCustom = () => {
	// const db = require('app/api/chat/db')
	// const query = require('app/api/chat/queries')

	const params = useParams();
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
	},[])

	const handleChangeMessage = (e: any) => {
		setInputMessage(e.target.value);
	};

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
			const response = await axios.post('/api/chat', {
				message: newMessage,
				userId: userId.current
			});

			setNewMessage({
				content: "Gpt response ", //response.data,
				id: nanoid(),
				role: 'assistant'
			});

			localSave(
				{
					message: "Gpt response",
					userId: 1,
					username: 'gpt'
				}
			)
			console.log("gpt engine response: ", response.data)
		} catch (error) {
			console.error(error);
		}
	}, []);

																					//------------------------------------------- send to open ai api
	async function localSave (data: object){
		console.log(`sended message: ${JSON.stringify(data)}`)
		const response: any = await axios.post('http://localhost:3001/send_message', data)
		const resp: any = await  JSON.stringify(response);
		// console.log("local save response: ",resp);
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
