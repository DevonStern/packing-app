export interface WithId {
	id: string
}

export interface ServerObj {
	serverUpdatedOn: string
	createdOn: string
	updatedOn: string
}

export interface Deletable {
	deleted?: boolean
}

export interface CreatedUpdated {
	createdOn: Date
	updatedOn: Date
}

export interface Sortable {
	sortOrder: number
}