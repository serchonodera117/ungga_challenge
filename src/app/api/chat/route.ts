import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
	console.log("esta es la peticion para open ai url")
	try {
		const json = await req.json();
		const { message, userId } = json;

		const response = await axios.post(`${process.env.ASSISTANT_URL}/message/` ?? '', {
			message,
			user_id: userId
		});
		console.log( NextResponse.json(response.data))
		return NextResponse.json(response.data);
	} catch (error) {
		console.log({ error });
		return NextResponse.json(error);
	}
}
