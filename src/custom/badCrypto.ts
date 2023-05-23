import type { ITask } from "@/modelTypes/ITask";
import { Buffer } from "buffer";

function decryptTasks(tasks: ITask[]) {
	return Promise.all(tasks.map((task) => decryptTask(task)));
}

async function encryptTask(task: ITask) {
	task.title = await encryptString(task.title);
	if (task.description) {
		task.description = await encryptString(task.description);
	}
	return task;
}

async function decryptTask(task: ITask) {
	task.title = await decryptString(task.title);

	if (task.description) {
		task.description = await decryptString(task.description);
	}

	return task;
}

async function encryptString(input: string) {
	const key = await getKey();

	if (!key) {
		return input;
	}

	const encoder = new TextEncoder();
	const encodedTitle = encoder.encode(input);
	const iv = window.crypto.getRandomValues(new Uint8Array(16));
	const cipherTitle = await window.crypto.subtle.encrypt(
		{ name: "AES-CBC", iv },
		key,
		encodedTitle
	);

	const b64CipherText = uintToBase64(
		new Uint8Array([...iv, ...new Uint8Array(cipherTitle)])
	);
	return `ɯ:${getKeyName()}:${b64CipherText}`;
}

async function decryptString(input: string) {
	const key = await getKey();
	const keyName = getKeyName();
	if (!key || !input.startsWith(`ɯ:${keyName}:`)) {
		return input;
	}

	const cipherInput = input.slice(`ɯ:${keyName}:`.length);
	const uintInput = base64ToUint(cipherInput);
	var iv = uintInput.subarray(0, 16);
	var encodedTitle = uintInput.subarray(16);
	const decryptedTitle = await window.crypto.subtle.decrypt(
		{ name: "AES-CBC", iv },
		key,
		encodedTitle
	);

	return abToString(decryptedTitle);
}

function getKeyName() {
	return localStorage.getItem("_aes_badcrypto_keyname");
}

function getKey() {
	let stringKey = localStorage.getItem("_aes_badcrypto_key");

	if (!stringKey) {
		return null;
	}

	const keyBuffer = base64ToUint(stringKey).buffer;

	return window.crypto.subtle.importKey(
		"raw",
		keyBuffer,
		{
			name: "AES-CBC",
			length: 256,
		},
		true,
		["encrypt", "decrypt"]
	);
}

function uintToBase64(uint8: Uint8Array) {
	return Buffer.from(uint8).toString("base64");
}

function base64ToUint(base64String: string) {
	return new Uint8Array(Buffer.from(base64String, "base64"));
}

function abToString(buf: ArrayBuffer) {
	return String.fromCharCode.apply(null, [...new Uint8Array(buf)]);
}

export { encryptTask, decryptTask, decryptTasks };
