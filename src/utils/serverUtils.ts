import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { CreatedUpdated, Deletable, ServerObj, WithId } from '../constants/modelConstants'
import { getSyncedOn } from '../sync/useSync'

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

export const scanInDynamoDb = async <T>(table: string, filterExpression?: string, expressionAttributeValues?: any): Promise<T[]> => {
	const client = getClient()
	try {
		const results = await client.scan({
			TableName: table,
			FilterExpression: filterExpression,
			ExpressionAttributeValues: expressionAttributeValues,
		})
		console.log('scanned in DynamoDB', results.Items)
		return results.Items as T[] ?? []
	} catch (error) {
		console.error('Failed to scan items from DynamoDB', error)
		throw error
	}
}

export const getChangesFromDynamoDb = async <T>(table: string): Promise<T[]> => {
	const syncedOn: Date = await getSyncedOn()
	const expressionAttributeValues = {
		":so": syncedOn.toISOString(),
	}
	const filterExpression = `serverUpdatedOn > :so`
	return scanInDynamoDb(table, filterExpression, expressionAttributeValues)
}

export const putInDynamoDb = async <T extends WithId & CreatedUpdated>(table: string, item: T) => {
	try {
		const client = getClient()
		const newItem: Omit<T, keyof CreatedUpdated> & ServerObj = {
			...item,
			serverUpdatedOn: new Date().toISOString(),
			createdOn: item.createdOn.toISOString(),
			updatedOn: item.updatedOn.toISOString(),
		}
		const results = await client.put({
			TableName: table,
			Item: newItem,
			// ConditionExpression: 'attribute_not_exists(id)',
		})
		console.log('put in DynamoDB', results)
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

export const markDeletedInDynamoDb = async <T extends WithId & CreatedUpdated>(table: string, item: T) => {
	try {
		const client = getClient()
		const newItem: Omit<T, keyof CreatedUpdated> & ServerObj & Deletable = {
			...item,
			serverUpdatedOn: new Date().toISOString(),
			createdOn: item.createdOn.toISOString(),
			updatedOn: new Date().toISOString(), //Since there isn't a new item that has the current updatedOn
			deleted: true,
		}
		const results = await client.put({
			TableName: table,
			Item: newItem,
		})
		console.log('marked deleted in DynamoDB', results)
	} catch (error: any) {
		console.error(error)
	}
}