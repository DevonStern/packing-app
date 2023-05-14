export interface WithId {
	id: string
}

export interface ServerObj {
	serverUpdatedOn: string
	createdOn: string
}

export interface Deletable {
	deleted?: boolean
}

export interface Created {
	createdOn: Date
}

export interface Sortable {
	sortOrder: number
}