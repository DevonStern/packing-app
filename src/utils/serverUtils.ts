import env from '../environment.json'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { CreatedUpdated, Deletable, ServerObj, WithId } from '../constants/modelConstants'
import { getSyncedOn } from '../sync/useSync'

const getClient = () => {
	const { accessKeyId, secretAccessKey, region } = env
	const client = new DynamoDBClient({
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
		region,
	})
	const docClient = DynamoDBDocument.from(client, {
		marshallOptions: {
			removeUndefinedValues: true,
		},
	})
	return docClient
}

export const scanInDynamoDb = async <T extends WithId>(
	table: string,
	parser: (records: Partial<T>[]) => T[],
	filterExpression?: string,
	expressionAttributeValues?: any,
): Promise<(T & Deletable)[]> => {
	const client = getClient()
	try {
		const { Items } = await client.scan({
			TableName: table,
			FilterExpression: filterExpression,
			ExpressionAttributeValues: expressionAttributeValues,
		})
		const parsed = parser(Items as any[] ?? [])
		// We have to be very specific in the parsers about what properties to include so we don't get unwanted properties
		// (such as `serverUpdatedOn`). So now we need to add back in the `deleted` properties.
		const parsedWithDeleted = parsed.map(p => {
			if (Items?.find(i => i.id === p.id && i.deleted)) {
				return {
					...p,
					deleted: true,
				}
			}
			return p
		})
		console.log('scanned in DynamoDB', parsedWithDeleted)
		return parsedWithDeleted
	} catch (error) {
		console.error('Failed to scan items from DynamoDB', error)
		throw error
	}
}

export const getChangesFromDynamoDb = async <T extends WithId>(
	table: string,
	parser: (records: Partial<T>[]) => T[],
): Promise<(T & Deletable)[]> => {
	const syncedOn: Date = await getSyncedOn()
	const expressionAttributeValues = {
		":so": syncedOn.toISOString(),
	}
	const filterExpression = `serverUpdatedOn > :so`
	return scanInDynamoDb(table, parser, filterExpression, expressionAttributeValues)
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
	} catch (error) {
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
	} catch (error) {
		console.error(error)
	}
}