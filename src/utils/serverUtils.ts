import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { Created, Deletable, ServerObj, WithId } from '../constants/modelConstants'

const getClient = () => {
	const client = new DynamoDBClient({
		credentials: {
			accessKeyId: 'AKIA3HRILWJYDERDXN7S',
			secretAccessKey: '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',
		},
		region: 'us-west-2',
	})
	const docClient = DynamoDBDocument.from(client)
	return docClient
}

export const scanInDynamoDb = async (table: string) => {
	const client = getClient()
	try {
		const results = await client.scan({
			TableName: table,
		});
		console.log(results.Items);
	} catch (err) {
		console.error(err);
	}
}

export const putInDynamoDb = async <T extends WithId & Created>(table: string, item: T) => {
	try {
		const client = getClient()
		const newItem: Omit<T, keyof Created> & ServerObj = {
			...item,
			serverUpdatedOn: new Date().toISOString(),
			createdOn: item.createdOn.toISOString(),
		}
		const results = await client.put({
			TableName: table,
			Item: newItem,
			// ConditionExpression: 'attribute_not_exists(id)',
		})
		console.log(results)
	} catch (error: any) {
		// if (error.name === 'ConditionalCheckFailedException') {
		// 	console.log(`Item already exists`)
		// 	return
		// }
		console.error(error)
	}
}

export const batchPutInDynamoDb = async () => {

}

export const markDeletedInDynamoDb = async <T extends WithId & Created>(table: string, item: T) => {
	try {
		const client = getClient()
		const newItem: Omit<T, keyof Created> & ServerObj & Deletable = {
			...item,
			serverUpdatedOn: new Date().toISOString(),
			createdOn: item.createdOn.toISOString(),
			deleted: true,
		}
		const results = await client.put({
			TableName: table,
			Item: newItem,
		})
		console.log(results)
	} catch (error: any) {
		console.error(error)
	}
}